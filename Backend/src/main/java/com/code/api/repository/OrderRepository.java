package com.code.api.repository;

import com.code.api.entity.Order;
import com.code.api.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUser(User user);
	Order findByRazorpayOrderId(String razorpayOrderId);

}
