package com.code.api.config;

import com.code.api.entity.CustomerDetails;
import com.code.api.entity.FoodItem;
import com.code.api.entity.User;
import com.code.api.repository.CustomerDetailsRepository;
import com.code.api.repository.FoodItemRepository;
import com.code.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private CustomerDetailsRepository customerDetailsRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultUsers();
        createDefaultFoodItems();
        createDefaultCustomerDetails();
    }

    private void createDefaultUsers() {
        if (userRepository.findAll().isEmpty()) {
            User admin = new User("admin","admin@gmail.com", passwordEncoder.encode("admin123"), "ADMIN");
            User customer=new User("Afzal","afzal@gmail.com",passwordEncoder.encode("12"),"CUSTOMER");
            userRepository.saveAll(Arrays.asList(admin, customer));
            System.out.println("✅ Default users created.");
        }
    }

    private void createDefaultFoodItems() {
        if (foodItemRepository.findAll().isEmpty()) {
            FoodItem f1 = new FoodItem("Margherita Pizza", "Classic cheese pizza", 249.0, "Pizza", "pizza.jpg");
            FoodItem f2 = new FoodItem("Veg Burger", "Fresh bun with veggie patty", 149.0, "Burger", "burger.jpg");
            FoodItem f3 = new FoodItem("Paneer Tikka", "Spicy grilled paneer cubes", 199.0, "Starter", "paneer.jpg");
            FoodItem f4 = new FoodItem("Fried Rice", "Veg fried rice with soy sauce", 179.0, "Main Course", "rice.jpg");
            FoodItem f5 = new FoodItem("Choco Lava Cake", "Delicious molten chocolate cake", 99.0, "Dessert", "cake.jpg");
            foodItemRepository.saveAll(Arrays.asList(f1, f2, f3, f4, f5));
            System.out.println("✅ Default food items created.");
        }
    }

    private void createDefaultCustomerDetails() {
        User customer = userRepository.findByUsername("john");
        if (customer != null && !customerDetailsRepository.existsByUser(customer)) {
            CustomerDetails details = new CustomerDetails();
            details.setStreet("123 Main Street");
            details.setCity("Kolkata");
            details.setState("West Bengal");
            details.setZipCode("700001");
            details.setCountry("India");
            details.setPhone("9876543210");
            details.setUser(customer);
            customerDetailsRepository.save(details);
            System.out.println("✅ Default customer details added for john.");
        }
    }
}
