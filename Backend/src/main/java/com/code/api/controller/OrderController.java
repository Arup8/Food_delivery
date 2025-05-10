package com.code.api.controller;

import com.code.api.entity.ConfirmPaymentRequest;
import com.code.api.entity.FoodItem;
import com.code.api.entity.Order;
import com.code.api.entity.OrderDTO;
import com.code.api.services.IOrderService;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Autowired
    private IOrderService orderService;

    // 🔍 Get all orders
    @GetMapping("/")
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderService.findAll();
        List<OrderDTO> dtoList = new ArrayList<>();

        for (Order order : orders) {
            int userId = (order.getUser() != null) ? order.getUser().getId() : -1;
            String username = (order.getUser() != null) ? order.getUser().getUsername() : "N/A";

            OrderDTO dto = new OrderDTO(
                order.getId(),
                userId,
                username,
                order.getFoodItems(),
                order.getDateTime(),
                order.getStatus(),
                order.getTotalamount()
            );

            dtoList.add(dto);
        }

        return dtoList;
    }


    // 🔍 Get order by ID
    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable int id) {
        return orderService.findById(id);
    }

    // 💾 Save new order manually (not from cart)
    @PostMapping
    public Order saveOrder(@RequestBody Order order) {
        return orderService.save(order);
    }

    // ❌ Delete order by ID
    @DeleteMapping("/{id}")
    public String deleteOrder(@PathVariable int id) {
        return orderService.deleteById(id);
    }

    @PutMapping("/update-status/{orderId}")
    public String updateOrderStatus(@PathVariable int orderId, @RequestParam String status) {
        Order order = orderService.findById(orderId);
        if (order == null) {
            return "Order not found!";
        }

        order.setStatus(status);
        orderService.save(order);
        return "Order status updated to: " + status;
    }
    
    // 📦 Get all orders by user ID
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable int userId) {
        return orderService.findByUserId(userId);
    }

    // ✅ Place an order from cart
    @PostMapping("/place/{userId}")
    public Order placeOrder(@PathVariable int userId, @RequestBody Map<String, Object> requestPayload) {
        System.out.println("Placing order for user ID: " + userId);

        // Extract cartItems and totalAmount from the request payload
        List<Map<String, Object>> cartItems = (List<Map<String, Object>>) requestPayload.get("cartItems");
        int totalAmount = (int) requestPayload.get("totalAmount");

        // Step 1: Create the order using the existing placeOrder(userId) method
        Order order = orderService.placeOrder(userId); // Continue using the old method that only takes userId
        System.out.println("Total amount: " + totalAmount);

        // Step 2: Set the cartItems and totalAmount to the order (this assumes you have setters for these fields)
      
        order.setTotalamount(totalAmount);

        try {
            // Step 3: Initialize Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

            // Step 4: Create Razorpay payment order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", totalAmount * 100);  // Total amount in paise (100 paise = 1 INR)
            orderRequest.put("currency", "INR"); // Currency
            orderRequest.put("receipt", "order_rcptid_" + order.getId());  // Receipt ID

            // Step 5: Create the Razorpay payment order
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            // Step 6: Save the Razorpay order ID to the database (Optional, for tracking)
            order.setRazorpayOrderId(razorpayOrderId);
            orderService.save(order); // Save the order with Razorpay order ID

            return order;  // Return the entire order, including Razorpay order ID
        } catch (Exception e) {
            e.printStackTrace();
            // Handle any exceptions (e.g., Razorpay API issues)
            throw new RuntimeException("Error while creating Razorpay order: " + e.getMessage());
        }
    }
    // Endpoint to verify Razorpay payment
    @PostMapping("/verify-payment")
    public String verifyPayment(@RequestBody ConfirmPaymentRequest paymentRequest) {
        try {
            String razorpayOrderId = paymentRequest.getRazorpayOrderId();
            String razorpayPaymentId = paymentRequest.getRazorpayPaymentId();
            String razorpaySignature = paymentRequest.getRazorpaySignature();

            // Verify the signature using Razorpay's SDK
            if (verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
                // Fetch payment details using Razorpay API
                RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);
                Payment payment = razorpayClient.payments.fetch(razorpayPaymentId);

                // Get the payment status
                String paymentStatus = payment.get("status").toString();

                if ("captured".equals(paymentStatus)) {
                    // Fetch order from DB using Razorpay order ID
                    Order order = orderService.getRazorpayOrderId(razorpayOrderId);
                    if (order != null) {
                        order.setStatus("paid");
                        orderService.save(order);
                        return "Payment verified and order status updated to 'paid'.";
                    } else {
                        return "Order not found!";
                    }
                } else {
                    return "Payment verification failed: Payment status is not captured.";
                }
            } else {
                return "Payment verification failed: Invalid signature.";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "Error during payment verification: " + e.getMessage();
        }
    }

    // Method to verify Razorpay payment signature
    private boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            // Create the string to be signed
            String data = razorpayOrderId + "|" + razorpayPaymentId;

            // Generate the expected signature by hashing the data with the Razorpay secret
            String generatedSignature = hmacSHA256(data, keySecret);

            // Compare the generated signature with the provided signature
            return generatedSignature.equals(razorpaySignature);
        } catch (Exception e) {
            return false;
        }
    }

    // Utility method to generate HMAC SHA256 hash (used for signature verification)
    private String hmacSHA256(String data, String secret) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes());
        return bytesToHex(rawHmac);
    }

    // Utility method to convert byte array to hex string
    private String bytesToHex(byte[] byteArray) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : byteArray) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

}


