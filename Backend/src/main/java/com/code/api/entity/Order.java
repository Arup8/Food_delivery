package com.code.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;


@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    private LocalDateTime dateTime;
	private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name="totalamount")
	double totalamount;
	@Column(name="razorpayOrderId")
	 private String razorpayOrderId;
	@Column(name="status")
	 private String status="in-Process";

    public double getTotalamount() {
		return totalamount;
	}

	public void setTotalamount(double totalamount) {
		this.totalamount = totalamount;
	}

	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}

	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}
	@ManyToMany
    @JoinTable(
        name = "order_food_items",
        joinColumns = @JoinColumn(name = "order_id"),
        inverseJoinColumns = @JoinColumn(name = "food_id")
    )
    private List<FoodItem> foodItems;



    public LocalDateTime getDateTime() {
		return dateTime;
	}

	public void setDateTime(LocalDateTime formattedDate) {
		this.dateTime = formattedDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Order() {}

    public Order(User user, List<FoodItem> foodItems) {
        this.user = user;
        this.foodItems = foodItems;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<FoodItem> getFoodItems() {
        return foodItems;
    }

    public void setFoodItems(List<FoodItem> foodItems) {
        this.foodItems = foodItems;
    }
    public Order(User user, List<FoodItem> foodItems, LocalDateTime dateTime, String status) {
        this.user = user;
        this.foodItems = foodItems;
        this.dateTime = dateTime;
        this.status = status;
    }

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

}