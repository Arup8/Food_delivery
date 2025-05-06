package com.code.api.services;

import com.code.api.entity.User;
import com.code.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public List<User> findAll() {
        return userRepo.findAll();
    }

    @Override
    public User findById(int id) {
        Optional<User> optional = userRepo.findById(id);
        return optional.orElse(null);
    }

    @Override
    public User save(User user) {
        return userRepo.save(user);
    }

    @Override
    public String deleteById(int id) {
        userRepo.deleteById(id);
        return "User deleted successfully";
    }

    @Override
    public User findByUsername(String username) {
        return userRepo.findByUsername(username);
    }
    public User findByEmail(String email) {
        return userRepo.findByUsername(email);
      
    }
}
