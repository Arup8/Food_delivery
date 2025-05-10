package com.code.api.services;

import com.code.api.entity.Order;


import java.util.List;

public interface IOrderService {
    List<Order> findAll();
    Order findById(int id);
    Order save(Order order);
    String deleteById(int id);
    Order placeOrder(int userId);
    List<Order> findByUserId(int userId);
	public Order getRazorpayOrderId(String id);
}
