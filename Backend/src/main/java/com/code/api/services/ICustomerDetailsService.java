package com.code.api.services;

import com.code.api.entity.CustomerDetails;

import java.util.List;
import java.util.Optional;

public interface ICustomerDetailsService {
    List<CustomerDetails> findAll();
    Optional<CustomerDetails> findById(Long id);
    CustomerDetails save(CustomerDetails customerDetails);
    void deleteById(Long id);
    CustomerDetails findByUserId(Long userId);
}
