import React, { useEffect, useState } from 'react';
import { useOrdersStore } from '../../store/useOrdersStore';
import { imageURL } from '../../lib/api'; // Adjust the import path as necessary

const OrderSection: React.FC = () => {
  const {
    orders,
    isLoading,
    error,
    fetchAllOrders,
    fetchOrderById,
    cancelOrder,
    updateOrderStatus,
  } = useOrdersStore((state) => ({
    orders: state.orders,
    isLoading: state.isLoading,
    error: state.error,
    fetchAllOrders: state.fetchAllOrders,
    fetchOrderById: state.fetchOrderById,
    cancelOrder: state.cancelOrder,
    updateOrderStatus: state.updateOrderStatus,
  }));

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
  };

  const handleViewOrder = (orderId: string) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
    } else {
      setSelectedOrderId(orderId);
      fetchOrderById(orderId);
    }
  };

  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderStatus(orderId, status);
  };

  const groupedOrders = orders.reduce((acc: Record<string, typeof orders>, order) => {
    const username = order.username || 'Unknown User';
    if (!acc[username]) acc[username] = [];
    acc[username].push(order);
    return acc;
  }, {});

  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Orders by User</h2>

      {isLoading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedOrders).map(([user, userOrders]) => (
            <div key={user} className="bg-white p-3 sm:p-4 rounded shadow">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-2">{user}</h3>

              <ul className="space-y-3">
                {userOrders.map((order) => (
                  <li key={order.id} className="border p-3 rounded">
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Date Time:</strong> {new Date(order.dateTime).toLocaleString()}</p>

                    {/* Responsive Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
                      >
                        {selectedOrderId === order.id ? 'Hide Details' : 'View Details'}
                      </button>

                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                      >
                        Cancel Order
                      </button>

                      <button
                        onClick={() => handleStatusChange(order.id, 'Out for Delivery')}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full sm:w-auto"
                      >
                        Out for Delivery
                      </button>

                      <button
                        onClick={() => handleStatusChange(order.id, 'Delivered')}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto"
                      >
                        Delivered
                      </button>
                    </div>

                    {/* Food Items */}
                    {selectedOrderId === order.id && (
                      <div className="mt-4">
                        <h4 className="text-base sm:text-lg font-semibold mb-2">Food Items:</h4>
                        <ul className="space-y-2">
                          {order.foodItems.map((foodItem) => (
                            <li key={foodItem.id} className="flex items-start gap-3">
                              <img
                                // src={`http://localhost:8186/images/${foodItem.image}`}
                                src={`${imageURL}${foodItem.image}`}
                                alt={foodItem.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{foodItem.name}</p>
                                <p className="text-sm text-gray-600">{foodItem.description}</p>
                                <p className="text-sm font-semibold">₹{foodItem.price}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderSection;
