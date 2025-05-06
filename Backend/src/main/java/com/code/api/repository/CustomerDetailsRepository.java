package com.code.api.repository;

import com.code.api.entity.CustomerDetails;
import com.code.api.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerDetailsRepository extends JpaRepository<CustomerDetails, Long> {
    CustomerDetails findByUserId(Long userId);
    boolean existsByUser(User user);
}
