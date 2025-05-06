package com.code.api.services;

import com.code.api.entity.User;
import java.util.List;

public interface IUserService {

    List<User> findAll();
    User findById(int id);
    User save(User user);
    String deleteById(int id);
    User findByEmail(String email);
    User findByUsername(String username);
}
