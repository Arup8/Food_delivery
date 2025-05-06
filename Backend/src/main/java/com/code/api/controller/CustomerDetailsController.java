package com.code.api.controller;

import com.code.api.entity.CustomerDetails;
import com.code.api.entity.User;
import com.code.api.services.ICustomerDetailsService;
import com.code.api.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customerdetails")
@CrossOrigin
public class CustomerDetailsController {

    @Autowired
    private ICustomerDetailsService customerDetailsService;

    @Autowired
    private IUserService userService;

    // Get all customer details
    @GetMapping
    public List<CustomerDetails> getAllCustomerDetails() {
        System.out.println("Fetching all customer details...");
        return customerDetailsService.findAll();
    }

    // Get customer details by ID
    @GetMapping("/{id}")
    public Optional<CustomerDetails> getCustomerDetailsById(@PathVariable Long id) {
        return customerDetailsService.findById(id);
    }

    // Get customer details by user ID
    @GetMapping("/user/{userId}")
    public Map<String, List<CustomerDetails>> getCustomerDetailsByUserId(@PathVariable Long userId) {
        CustomerDetails details = customerDetailsService.findByUserId(userId);
        List<CustomerDetails> data = (details != null) ? List.of(details) : List.of();

        Map<String, List<CustomerDetails>> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    // Add or update customer details linked with existing User
    @PutMapping("/update/{id}")
    public CustomerDetails updateDetails(@PathVariable("id") int addressId, @RequestBody CustomerDetails customerDetails) {
        // Ensure the correct ID is set on the customerDetails object
        customerDetails.setId((long) addressId);

        // Extract user ID from nested user object
        if (customerDetails.getUser() == null || customerDetails.getUser().getId() == 0) {
            throw new RuntimeException("User ID is required for updating customer details.");
        }

        // Fetch and attach the actual User entity
        User user = userService.findById(customerDetails.getUser().getId());
        if (user == null) {
            throw new RuntimeException("User not found with ID: " + customerDetails.getUser().getId());
        }

        customerDetails.setUser(user);

        System.out.println("Updating customer details: " + customerDetails);
        return customerDetailsService.save(customerDetails);
    }


    
    @PostMapping("/user/{userId}")
    public CustomerDetails saveDetails(@PathVariable int userId, @RequestBody CustomerDetails customerDetails) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        customerDetails.setUser(user);
        return customerDetailsService.save(customerDetails);
    }

    // Delete customer details
    @DeleteMapping("/{id}")
    public void deleteCustomerDetails(@PathVariable Long id) {
        customerDetailsService.deleteById(id);
    }
}
