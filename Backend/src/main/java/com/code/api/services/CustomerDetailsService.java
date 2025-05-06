package com.code.api.services;

import com.code.api.entity.CustomerDetails;
import com.code.api.repository.CustomerDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerDetailsService implements ICustomerDetailsService {

    @Autowired
    private CustomerDetailsRepository customerDetailsRepository;

    @Override
    public List<CustomerDetails> findAll() {
        return customerDetailsRepository.findAll();
    }

    @Override
    public Optional<CustomerDetails> findById(Long id) {
        return customerDetailsRepository.findById(id);
    }

    @Override
    public CustomerDetails save(CustomerDetails customerDetails) {
        return customerDetailsRepository.save(customerDetails);
    }

    @Override
    public void deleteById(Long id) {
        customerDetailsRepository.deleteById(id);
    }

    @Override
    public CustomerDetails findByUserId(Long userId) {
        return customerDetailsRepository.findByUserId(userId);
    }
}
