import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { QRCodeSVG } from 'qrcode.react';

function OrderDetails() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `https://thbb.onrender.com/api/orders/token/${token}`,
        {
          headers: {
            'x-access-token': currentUser.token
          }
        }
      );
      
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch order details');
      setLoading(false);
      console.error('Error fetching order details:', err);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center p-8">Order not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Details</h2>
        <Link to="/orders" className="text-blue-500 hover:text-blue-700">
          Back to Orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-semibold">Order #{order.token}</p>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium ${
                order.status === 'pending' ? 'text-yellow-600' : 
                order.status === 'confirmed' ? 'text-blue-600' : 
                order.status === 'delivered' ? 'text-green-600' : 
                order.status === 'out_for_delivery' ? 'text-orange-600' : 'text-red-600'
              }`}>{order.status}</span>
            </p>
            <p className="text-sm text-gray-600">
              Ordered on: {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <p className="font-bold">${order.total_price}</p>
        </div>
        
        <div className="mb-4">
          <p className="font-medium">Delivery Address:</p>
          <p className="text-sm">{order.address}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Order Items</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.menu_item.image_url && (
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <img className="h-10 w-10 rounded-full" src={item.menu_item.image_url} alt={item.menu_item.name} />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.menu_item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price_at_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item.price_at_time * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Order QR Code</h3>
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-600">Show this QR code to your delivery person for verification:</p>
            <div className="p-4 bg-white border border-gray-300 rounded-lg">
              <QRCodeSVG value={order.token} size={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;

