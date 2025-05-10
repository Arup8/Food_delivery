package com.code.api.services;

import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.code.api.entity.Payments;
import com.code.api.repository.OrderRepository;
import com.code.api.repository.PaymentReposatory;
import com.razorpay.RazorpayClient;

@Service
public class PaymentsService implements IPaymentService {
	@Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Autowired
    private OrderRepository ordersReposatory;
    @Autowired
    private PaymentReposatory paymentReposatory;
	@Override
	public Payments creatPayment(Payments payment) {
		// TODO Auto-generated method stub
		return paymentReposatory.save(payment);
	}
	
	@Override
	public Payments getPaymentById(int id) {
		// TODO Auto-generated method stub
		return paymentReposatory.findById(id).get();
	}
	@Override
	public List<Payments> getAllPayments() {
		// TODO Auto-generated method stub
		return paymentReposatory.findAll();
	}
	
}
