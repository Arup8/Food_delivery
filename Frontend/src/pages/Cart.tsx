import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { imageURL } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { verifyPayment } from '../lib/api'; // Import the verifyPayment function

function Cart() {
  const { user } = useAuthStore();
  const { cartItems, isLoading, error, fetchCartItems, removeFromCart, checkout } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();
  declare global {
  interface Window {
    Razorpay: any;
  }
}


  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  // Debug cart items
  useEffect(() => {
    if (Array.isArray(cartItems)) {
      cartItems.forEach(item => {
        console.log("Cart item:", item);
      });
    }
  }, [cartItems]);

  const calculateTotal = () => {
    return Array.isArray(cartItems)
      ? cartItems.reduce((totalamount, item) => totalamount + item.price, 0)
      : 0;
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
      console.error(err);
    }
  };

 const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
  
    setIsCheckingOut(true);
    try {
      const totalAmount = calculateTotal();

      const payload = {
        cartItems,
        totalAmount,
      };

      // Send user ID and cart data to backend for order placement
      const order = await checkout(user.id, payload);  // Send user ID here
      console.log('Order response:', order);
      if (!order || !order.razorpayOrderId) {
        throw new Error('Failed to place order');
      }
      console.log('Order placed:', order);
      console.log(order.razorpayOrderId)

      // Step 1: Initialize Razorpay checkout
      const options = {
        key: "rzp_test_2lT4Ps7v1lCf1R",  // Replace with your Razorpay key
        amount: order.totalamount,          // Convert to paise
        currency: "INR",
        name: "Food Delivery",
        description: "Payment for your food order",
        image: "logo.jpg",  // Optional logo for Razorpay modal
        order_id: order.razorpayOrderId,  // Razorpay order ID from backend
        handler: async function (response) {
          // Step 2: Verify payment after success
          const paymentDetails = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
          };
          console.log("Order ID:", paymentDetails.razorpayOrderId);
  console.log("Payment ID:", paymentDetails.razorpayPaymentId);
  console.log("Signature:", paymentDetails.razorpaySignature);

          try {
            const verificationResponse = await verifyPayment(paymentDetails);
            if (verificationResponse === 'Payment verified and order status updated to \'paid\'') {
              toast.success('Payment successful and order confirmed!');
              navigate('/orders');  // Redirect to orders page
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Payment verification failed');
            console.error(err);
          }
        },
        prefill: {
          name: user?.name || 'Guest',
          email: user?.email || '',
          contact: user?.contact || '',
        },
        notes: {
          address: 'Food Delivery Address',
        },
        theme: {
          color: "#FF9F00",  // Customize the color of the Razorpay modal
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      toast.error('Checkout failed');
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
};


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchCartItems}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some delicious items from our menu!</p>
        <Link
          to="/menu"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Placeholder image – update if you have an image field */}
            <img
              src={`${imageURL}${item.image}`}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className="text-orange-600 font-bold">₹{item.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-md font-medium text-gray-800">
                  Total: ₹{item.price.toFixed(2)}
                </span>
                <button
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md flex justify-between items-center">
        <div className="text-xl font-semibold">
          Total: <span className="text-orange-600">₹{calculateTotal().toFixed(2)}</span>
        </div>
        <button
          className={`px-6 py-3 rounded-md text-white font-medium ${
            isCheckingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
          }`}
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
}

export default Cart;
