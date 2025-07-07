import React, { useState, useEffect } from 'react';
import AuthService from '../services/auth.service';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import { QrReader } from 'react-qr-reader';
import { User, LogOut, Truck, MapPin, Clock, CheckCircle, Package, Scan, X } from 'lucide-react';

function DeliveryDashboard() {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [verifyingOrderId, setVerifyingOrderId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningOrderId, setScanningOrderId] = useState(null);
  
  // Add logout handler
  const handleLogout = () => {
    AuthService.logout();
    navigate('/signin');
  };
  
  useEffect(() => {
    if (currentUser && currentUser.user && currentUser.user.role === 'delivery') {
      fetchAssignedOrders();
      
      // Join delivery-specific room
      socket.emit('join-delivery-room', currentUser.user.id);
      
      // Listen for order updates specific to this delivery person
      socket.on('delivery-order-updated', (data) => {
        updateOrderInState(data.order);
      });
      
      // Listen for general order updates
      socket.on('order-status-updated', (data) => {
        if (data.order && data.order.delivery_guy_id === currentUser.user.id) {
          updateOrderInState(data.order);
        }
      });
    }
    
    return () => {
      socket.off('delivery-order-updated');
      socket.off('order-status-updated');
    };
  }, []);
  
  const updateOrderInState = (updatedOrder) => {
    setAssignedOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };
  
  const fetchAssignedOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/orders/assigned/${currentUser.user.id}`,
        {
          headers: {
            'x-access-token': currentUser.token
          }
        }
      );
      
      setAssignedOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch assigned orders');
      setLoading(false);
      console.error('Error fetching assigned orders:', err);
    }
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'x-access-token': currentUser.token
          }
        }
      );
      
      console.log('Update response:', response.data);
      
      // Emit socket event for real-time update
      socket.emit('order-status-update', { order: response.data.order });
      
      // Update the order in the local state
      if (response.data && response.data.order) {
        updateOrderInState(response.data.order);
      } else {
        // Refresh the orders list as fallback
        fetchAssignedOrders();
      }
      
      // Reset verification state
      setVerifyingOrderId(null);
      setVerificationToken('');
      
      // Show success notification
      showNotification(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order status:', err.response?.data || err.message);
    }
  };

  const startVerification = (orderId) => {
    setVerifyingOrderId(orderId);
    setVerificationToken('');
  };

  const verifyAndDeliver = async (order) => {
    try {
      console.log('Verifying token:', verificationToken, 'for order ID:', order.id);
      
      const response = await axios.get(
        `http://localhost:5000/api/orders/token/${verificationToken}`,
        {
          headers: {
            'x-access-token': currentUser.token
          }
        }
      );
      
      console.log('Token verification response:', response.data);
      
      if (response.data && response.data.id === order.id) {
        console.log('Token verified successfully, updating order status');
        updateOrderStatus(order.id, 'delivered');
        setVerifyingOrderId(null);
        setVerificationToken('');
      } else {
        console.log('Token verification failed - order IDs do not match');
        setError('Invalid token. Please verify the token and try again.');
      }
    } catch (err) {
      console.error('Error verifying token:', err.response?.data || err.message);
      setError('Invalid token or verification failed');
    }
  }

  const handleScan = (result) => {
    if (result && result.text) {
      setVerificationToken(result.text);
      setShowScanner(false);
    }
  };

  const handleScanError = (error) => {
    console.error('QR scan error:', error);
    setError('Failed to scan QR code. Please try again or enter the code manually.');
  };

  const startScanningQR = (orderId) => {
    setScanningOrderId(orderId);
    setShowScanner(true);
    setVerifyingOrderId(orderId);
  }

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-blue-400';
      case 'delivered': return 'text-green-400';
      case 'out_for_delivery': return 'text-orange-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'out_for_delivery': return 'bg-orange-500';
      default: return 'bg-yellow-500';
    }
  };
  
  if (!currentUser || !currentUser.user) {
    return <Navigate to="/signin" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      {/* <div className="bg-gradient-to-r from-orange-600 to-red-600 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Delivery Dashboard</h1>
              <div className="flex items-center space-x-4 text-orange-100">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Welcome, {currentUser.user.name}!</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="w-4 h-4" />
                  <span className="px-2 py-1 bg-orange-500 bg-opacity-30 rounded-full text-xs font-medium">
                    {currentUser.user.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{assignedOrders.length}</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Out for Delivery</p>
                <p className="text-2xl font-bold text-white">
                  {assignedOrders.filter(order => order.status === 'out_for_delivery').length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Delivered Today</p>
                <p className="text-2xl font-bold text-white">
                  {assignedOrders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Assigned Orders</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {assignedOrders.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <Truck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No orders assigned to you yet.</p>
            <p className="text-gray-500">Check back later for new delivery assignments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {assignedOrders.map(order => (
              <div key={order.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg text-white">Order #{order.token}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-400">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(order.status)} text-white`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500">${order.total_price}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-gray-300">Delivery Address:</p>
                        <p className="text-sm text-white">{order.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  {order.status === 'pending' && (
                    <button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Mark as Out for Delivery</span>
                    </button>
                  )}
                  
                  {order.status === 'out_for_delivery' && (
                    verifyingOrderId === order.id ? (
                      <div className="space-y-4">
                        {showScanner ? (
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="relative">
                              <QrReader
                                constraints={{ facingMode: 'environment' }}
                                onResult={handleScan}
                                style={{ width: '100%' }}
                              />
                              <button 
                                className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-full transition-colors"
                                onClick={() => setShowScanner(false)}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Verify Order Token:
                            </label>
                            <div className="flex space-x-2">
                              <input 
                                type="text" 
                                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                value={verificationToken}
                                onChange={(e) => setVerificationToken(e.target.value)}
                                placeholder="Enter order token"
                              />
                              <button
                                onClick={() => startScanningQR(order.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
                              >
                                <Scan className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button 
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                            onClick={() => verifyAndDeliver(order)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Verify & Deliver</span>
                          </button>
                          <button 
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            onClick={() => {
                              setVerifyingOrderId(null);
                              setShowScanner(false);
                              setVerificationToken('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        onClick={() => startVerification(order.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Delivered</span>
                      </button>
                    )
                  )}

                  {order.status === 'delivered' && (
                    <div className="flex items-center justify-center space-x-2 py-3 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Order Delivered Successfully</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryDashboard;













// import React, { useState, useEffect } from 'react';
// import AuthService from '../services/auth.service';
// import { Navigate, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import socket from '../socket';
// import { QrReader } from 'react-qr-reader';

// function DeliveryDashboard() {
//   const navigate = useNavigate();
//   const currentUser = AuthService.getCurrentUser();
//   const [assignedOrders, setAssignedOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [verificationToken, setVerificationToken] = useState('');
//   const [verifyingOrderId, setVerifyingOrderId] = useState(null);
//   const [showScanner, setShowScanner] = useState(false);
//   const [scanningOrderId, setScanningOrderId] = useState(null);
  
//   // Add logout handler
//   const handleLogout = () => {
//     AuthService.logout();
//     navigate('/signin');
//   };
  
//   useEffect(() => {
//     if (currentUser && currentUser.user && currentUser.user.role === 'delivery') {
//       fetchAssignedOrders();
      
//       // Join delivery-specific room
//       socket.emit('join-delivery-room', currentUser.user.id);
      
//       // Listen for order updates specific to this delivery person
//       socket.on('delivery-order-updated', (data) => {
//         // console.log('Received order update:', data);
//         updateOrderInState(data.order);
//       });
      
//       // Listen for general order updates
//       socket.on('order-status-updated', (data) => {
//         if (data.order && data.order.delivery_guy_id === currentUser.user.id) {
//           updateOrderInState(data.order);
//         }
//       });
//     }
    
//     return () => {
//       socket.off('delivery-order-updated');
//       socket.off('order-status-updated');
//     };
//   }, []);
  
//   const updateOrderInState = (updatedOrder) => {
//     setAssignedOrders(prevOrders => 
//       prevOrders.map(order => 
//         order.id === updatedOrder.id ? updatedOrder : order
//       )
//     );
//   };
  
//   const fetchAssignedOrders = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/orders/assigned/${currentUser.user.id}`,
//         {
//           headers: {
//             'x-access-token': currentUser.token
//           }
//         }
//       );
      
//       setAssignedOrders(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch assigned orders');
//       setLoading(false);
//       console.error('Error fetching assigned orders:', err);
//     }
//   };
  
//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
//       const response = await axios.put(
//         `http://localhost:5000/api/orders/${orderId}/status`,
//         { status: newStatus },
//         {
//           headers: {
//             'x-access-token': currentUser.token
//           }
//         }
//       );
      
//       console.log('Update response:', response.data);
      
//       // Emit socket event for real-time update
//       socket.emit('order-status-update', { order: response.data.order });
      
//       // Update the order in the local state
//       if (response.data && response.data.order) {
//         updateOrderInState(response.data.order);
//       } else {
//         // Refresh the orders list as fallback
//         fetchAssignedOrders();
//       }
      
//       // Reset verification state
//       setVerifyingOrderId(null);
//       setVerificationToken('');
//     } catch (err) {
//       setError('Failed to update order status');
//       console.error('Error updating order status:', err.response?.data || err.message);
//     }
//   };

//   const startVerification = (orderId) => {
//     setVerifyingOrderId(orderId);
//     setVerificationToken('');
//   };

//   const verifyAndDeliver = async (order) => {
//     try {
//       // Add debug logging
//       console.log('Verifying token:', verificationToken, 'for order ID:', order.id);
      
//       // Verify token against backend
//       const response = await axios.get(
//         `http://localhost:5000/api/orders/token/${verificationToken}`,
//         {
//           headers: {
//             'x-access-token': currentUser.token
//           }
//         }
//       );
      
//       // Log the response to see its structure
//       console.log('Token verification response:', response.data);
      
//       // Check if the order exists and matches the current order ID
//       if (response.data && response.data.id === order.id) {
//         console.log('Token verified successfully, updating order status');
//         updateOrderStatus(order.id, 'delivered');
//         setVerifyingOrderId(null);
//         setVerificationToken('');
//       } else {
//         console.log('Token verification failed - order IDs do not match');
//         console.log('Response order ID:', response.data?.id, 'Current order ID:', order.id);
//         setError('Invalid token. Please verify the token and try again.');
//       }
//     } catch (err) {
//       console.error('Error verifying token:', err.response?.data || err.message);
//       setError('Invalid token or verification failed');
//     }
//   }

//   const handleScan = (result) => {
//     if (result && result.text) {
//       setVerificationToken(result.text);
//       setShowScanner(false);
//     }
//   };

//   const handleScanError = (error) => {
//     console.error('QR scan error:', error);
//     setError('Failed to scan QR code. Please try again or enter the code manually.');
//   };

//   const startScanningQR = (orderId) => {
//     setScanningOrderId(orderId);
//     setShowScanner(true);
//     setVerifyingOrderId(orderId);
//   }
  
//   if (!currentUser || !currentUser.user) {
//     return <Navigate to="/signin" />;
//   }

//   if (loading) {
//     return <div className="text-center p-8">Loading orders...</div>;
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold">Delivery Dashboard</h2>
//         <button 
//           onClick={handleLogout}
//           className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//         >
//           Logout
//         </button>
//       </div>
//       <p className="mb-4">Welcome, <span className="font-semibold">{currentUser.user.name}</span>!</p>
//       <p className="mb-6">Your role: <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{currentUser.user.role}</span></p>
      
//       <h3 className="text-xl font-semibold mb-4">Your Assigned Orders</h3>
      
//       {error && <div className="mb-4 text-red-500">{error}</div>}
      
//       {assignedOrders.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <p>No orders assigned to you yet.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {assignedOrders.map(order => (
//             <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <p className="font-semibold">Order #{order.token}</p>
//                   <p className="text-sm text-gray-600">
//                     Status: <span className={`font-medium ${
//                       order.status === 'pending' ? 'text-blue-600' : 
//                       order.status === 'delivered' ? 'text-green-600' : 
//                       order.status === 'out_for_delivery' ? 'text-orange-600' : 'text-yellow-600'
//                     }`}>{order.status}</span>
//                   </p>
//                 </div>
//                 <p className="font-bold">${order.total_price}</p>
//               </div>
              
//               <div className="mb-4">
//                 <p className="font-medium">Delivery Address:</p>
//                 <p className="text-sm">{order.address}</p>
//               </div>
              
//               {order.status === 'pending' && (
//                 <button 
//                   className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded mb-2"
//                   onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
//                 >
//                   Mark as Out for Delivery
//                 </button>
//               )}
              
//               {order.status === 'out_for_delivery' && (
//                 verifyingOrderId === order.id ? (
//                   <div className="mt-2">
//                     {showScanner ? (
//                       <div className="mb-4">
//                         <div className="relative">
//                           <QrReader
//                             constraints={{ facingMode: 'environment' }}
//                             onResult={handleScan}
//                             style={{ width: '100%' }}
//                           />
//                           <button 
//                             className="absolute top-2 right-2 bg-gray-800 text-white p-1 rounded-full"
//                             onClick={() => setShowScanner(false)}
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="mb-2">
//                         <label className="block text-sm font-medium text-gray-700">Verify Order Token:</label>
//                         <div className="flex mt-1">
//                           <input 
//                             type="text" 
//                             className="flex-1 block border border-gray-300 rounded-l-md shadow-sm p-2"
//                             value={verificationToken}
//                             onChange={(e) => setVerificationToken(e.target.value)}
//                             placeholder="Enter order token"
//                           />
//                           <button
//                             onClick={() => startScanningQR(order.id)}
//                             className="bg-blue-500 text-white px-3 py-2 rounded-r-md"
//                           >
//                             Scan QR
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                     <div className="flex space-x-2">
//                       <button 
//                         className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
//                         onClick={() => verifyAndDeliver(order)}
//                       >
//                         Verify & Deliver
//                       </button>
//                       <button 
//                         className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
//                         onClick={() => {
//                           setVerifyingOrderId(null);
//                           setShowScanner(false);
//                         }}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <button 
//                     className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
//                     onClick={() => startVerification(order.id)}
//                   >
//                     Mark as Delivered
//                   </button>
//                 )
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default DeliveryDashboard;



