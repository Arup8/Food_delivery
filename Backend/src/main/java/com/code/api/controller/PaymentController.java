package com.code.api.controller;

import com.code.api.entity.Order;
import com.code.api.entity.User;
import com.code.api.repository.OrderRepository;
import com.code.api.services.IOrderService;
import com.code.api.services.IUserService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Autowired
    private IOrderService orderService;

    @Autowired
    private IUserService userService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Order orderRequest) {
        try {
            // Validate User
        	System.out.println(orderRequest.getTotalamount());
        	System.out.println(orderRequest.getUser());
          	System.out.println(orderRequest.getUser().getId());
        	
            if (orderRequest.getUser() == null || orderRequest.getUser().getId() == 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid User ID");
            }

            User user = userService.findById(orderRequest.getUser().getId());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // Amount in paise
            int amountInPaise = (int) (orderRequest.getTotalamount() * 100);

            // Create Razorpay order
            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", "order_rcptid_" + System.currentTimeMillis());
            options.put("payment_capture", 1);

            com.razorpay.Order razorOrder = razorpayClient.orders.create(options);

            // Save order to DB
            Order newOrder = new Order();
            newOrder.setUser(user);
            newOrder.setStatus("PENDING");
            newOrder.setTotalamount(orderRequest.getTotalamount());
            newOrder.setRazorpayOrderId(razorOrder.get("id"));
            orderRepository.save(newOrder);

            // Send response
            Map<String, Object> response = new HashMap<>();
            response.put("razorpayOrderId", razorOrder.get("id"));
            response.put("amount", amountInPaise);
            response.put("currency", "INR");

            return ResponseEntity.ok(response);

        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating Razorpay order");
        }
    }

    @GetMapping("/order/{id}")
    public ResponseEntity<Order> getRazorpayOrder(@PathVariable("id") String id) {
        Order order = orderService.getRazorpayOrderId(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
