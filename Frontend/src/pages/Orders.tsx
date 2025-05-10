import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useOrdersStore } from '../store/useOrdersStore';
import toast from 'react-hot-toast';
import { imageURL } from '../lib/api';

function OrderStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Delivered
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
}

function Orders() {
  const { user } = useAuthStore();
  const { orders, isLoading, error, fetchOrders, cancelOrder } = useOrdersStore();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel order');
      console.error(err);
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchOrders()}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No orders yet</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't placed any orders yet.</p>
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {formatDate(order.dateTime)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Total: ₹
                    {Array.isArray(order.foodItems)
                      ? order.foodItems.reduce((sum, item) => sum + (item?.price ?? 0), 0).toFixed(2)
                      : '0.00'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Array.isArray(order.foodItems) ? order.foodItems.length : 0} items
                  </p>
                </div>

                <div className="flex space-x-2">
                  {order.status.toLowerCase() === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={() => toggleOrderDetails(order.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
            </div>

            {expandedOrder === order.id && Array.isArray(order.foodItems) && (
              <div className="p-6 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-4">
                  {order.foodItems.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <div className="w-16 h-16 bg-gray-200 rounded-md" >
                        <img
                          src={`${imageURL}${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      <div className="ml-4">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-600">₹{item.price?.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>

                      <div className="ml-auto text-right">
                        <span className="font-medium text-gray-900">
                          ₹{item.price?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
