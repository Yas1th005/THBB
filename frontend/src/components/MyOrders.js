import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Package,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Truck,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import AuthService from "../services/auth.service";
import axios from "axios";

function MyOrders() {
  const currentUser = AuthService.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.user) {
      fetchUserOrders();
    }
  }, []);

  const fetchUserOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/orders/user",
        {
          headers: {
            "x-access-token": currentUser.token,
          },
        }
      );

      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
      console.error("Error fetching orders:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "out_for_delivery":
        return <Truck className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-blue-400";
      case "delivered":
        return "text-green-400";
      case "out_for_delivery":
        return "text-orange-400";
      default:
        return "text-yellow-400";
    }
  };

  const formatStatus = (status) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!currentUser || !currentUser.user) {
    return <Navigate to="/signin" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center text-red-400 p-6 sm:p-8 max-w-sm mx-auto">
          <p className="text-lg sm:text-xl mb-4">Oops! Something went wrong</p>
          <p className="text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-1 sm:mb-2">
              My Orders
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm lg:text-base">
              Track your delicious meals and order history
            </p>
          </div>
        </div>
      </div>

      {/* Orders Content - Mobile First */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 lg:p-12 max-w-sm sm:max-w-md mx-auto">
              <ShoppingBag className="w-12 sm:w-16 h-12 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                No Orders Yet
              </h3>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                You haven't placed any orders yet. Start exploring our delicious
                menu!
              </p>
              <Link
                to="/home"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2 text-sm sm:text-base"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Menu</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="p-3 sm:p-4 lg:p-6">
                  {/* Order Header - Mobile Stack Layout */}
                  <div className="mb-3 sm:mb-4">
                    {/* Order Number and Status */}
                    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start mb-2 sm:mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                          <Package className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="font-semibold text-white text-sm sm:text-base truncate">
                            Order #{order.token}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                          {getStatusIcon(order.status)}
                          <span className="text-xs sm:text-sm">
                            Status:{" "}
                            <span
                              className={`font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {formatStatus(order.status)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Price - Mobile: Below on small screens, Right on larger */}
                      <div className="xs:text-right mt-2 xs:mt-0 xs:ml-4">
                        <span className="text-xl sm:text-2xl font-bold text-orange-500">
                          ₹{order.total_price}
                        </span>
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400 mb-1">
                      <Clock className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                      <span className="break-all">
                        Ordered on:{" "}
                        <span className="hidden sm:inline">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                        <span className="sm:hidden">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </span>
                    </div>

                    {/* Delivery Person */}
                    {order.delivery_person && (
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                        <User className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          Delivery Person:{" "}
                          <span className="font-medium text-white">
                            {order.delivery_person.name}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delivery Address - Mobile Optimized */}
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-700 rounded-md sm:rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-xs sm:text-sm mb-1">
                          Delivery Address:
                        </p>
                        <p className="text-xs sm:text-sm text-gray-300 break-words">
                          {order.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button - Full Width on Mobile */}
                  <div className="flex justify-end">
                    <Link
                      to={`/orders/${order.token}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-md sm:rounded-lg font-medium transition-colors text-xs sm:text-sm inline-flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <Package className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;















// import React, { useState, useEffect } from "react";
// import { Link, Navigate } from "react-router-dom";
// import {
//   Package,
//   Clock,
//   MapPin,
//   User,
//   CheckCircle,
//   Truck,
//   AlertCircle,
//   ShoppingBag,
// } from "lucide-react";
// import AuthService from "../services/auth.service";
// import axios from "axios";

// function MyOrders() {
//   const currentUser = AuthService.getCurrentUser();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (currentUser && currentUser.user) {
//       fetchUserOrders();
//     }
//   }, []);

//   const fetchUserOrders = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:5000/api/orders/user",
//         {
//           headers: {
//             "x-access-token": currentUser.token,
//           },
//         }
//       );

//       setOrders(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to fetch orders");
//       setLoading(false);
//       console.error("Error fetching orders:", err);
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "confirmed":
//         return <CheckCircle className="w-4 h-4 text-blue-400" />;
//       case "delivered":
//         return <CheckCircle className="w-4 h-4 text-green-400" />;
//       case "out_for_delivery":
//         return <Truck className="w-4 h-4 text-orange-400" />;
//       default:
//         return <AlertCircle className="w-4 h-4 text-yellow-400" />;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "confirmed":
//         return "text-blue-400";
//       case "delivered":
//         return "text-green-400";
//       case "out_for_delivery":
//         return "text-orange-400";
//       default:
//         return "text-yellow-400";
//     }
//   };

//   const formatStatus = (status) => {
//     return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
//   };

//   if (!currentUser || !currentUser.user) {
//     return <Navigate to="/signin" />;
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
//           <p className="text-gray-300">Loading your orders...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="text-center text-red-400 p-8">
//           <p className="text-xl mb-4">Oops! Something went wrong</p>
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-orange-600 to-red-600 py-6 sm:py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
//               My Orders
//             </h1>
//             <p className="text-orange-100 text-sm sm:text-base">
//               Track your delicious meals and order history
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Orders Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//         {orders.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="bg-gray-800 rounded-xl p-8 sm:p-12 max-w-md mx-auto">
//               <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold mb-2 text-white">
//                 No Orders Yet
//               </h3>
//               <p className="text-gray-400 mb-6">
//                 You haven't placed any orders yet. Start exploring our delicious
//                 menu!
//               </p>
//               <Link
//                 to="/home"
//                 className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
//               >
//                 <ShoppingBag className="w-4 h-4" />
//                 <span>Browse Menu</span>
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4 sm:space-y-6">
//             {orders.map((order) => (
//               <div
//                 key={order.id}
//                 className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 <div className="p-4 sm:p-6">
//                   {/* Order Header */}
//                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-2 mb-2">
//                         <Package className="w-4 h-4 text-orange-500" />
//                         <span className="font-semibold text-white">
//                           Order #{order.token}
//                         </span>
//                       </div>

//                       <div className="flex items-center space-x-2 mb-2">
//                         {getStatusIcon(order.status)}
//                         <span className="text-sm">
//                           Status:{" "}
//                           <span
//                             className={`font-medium ${getStatusColor(
//                               order.status
//                             )}`}
//                           >
//                             {formatStatus(order.status)}
//                           </span>
//                         </span>
//                       </div>

//                       <div className="flex items-center space-x-2 text-sm text-gray-400">
//                         <Clock className="w-4 h-4" />
//                         <span>
//                           Ordered on:{" "}
//                           {new Date(order.created_at).toLocaleString()}
//                         </span>
//                       </div>

//                       {order.delivery_person && (
//                         <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
//                           <User className="w-4 h-4" />
//                           <span>
//                             Delivery Person:{" "}
//                             <span className="font-medium text-white">
//                               {order.delivery_person.name}
//                             </span>
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     <div className="text-right">
//                       <span className="text-2xl font-bold text-orange-500">
//                         ₹{order.total_price}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Delivery Address */}
//                   <div className="mb-4 p-3 bg-gray-700 rounded-lg">
//                     <div className="flex items-start space-x-2">
//                       <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="font-medium text-white text-sm mb-1">
//                           Delivery Address:
//                         </p>
//                         <p className="text-sm text-gray-300">{order.address}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Action Button */}
//                   <div className="flex justify-end">
//                     <Link
//                       to={`/orders/${order.token}`}
//                       className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm inline-flex items-center space-x-2"
//                     >
//                       <Package className="w-4 h-4" />
//                       <span>View Details</span>
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MyOrders;

// import React, { useState, useEffect } from 'react';
// import { Link, Navigate } from 'react-router-dom';
// import AuthService from '../services/auth.service';
// import axios from 'axios';

// function MyOrders() {
//   const currentUser = AuthService.getCurrentUser();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (currentUser && currentUser.user) {
//       fetchUserOrders();
//     }
//   }, []);

//   const fetchUserOrders = async () => {
//     try {
//       const response = await axios.get(
//         'http://localhost:5000/api/orders/user',
//         {
//           headers: {
//             'x-access-token': currentUser.token
//           }
//         }
//       );

//       setOrders(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch orders');
//       setLoading(false);
//       console.error('Error fetching orders:', err);
//     }
//   };

//   if (!currentUser || !currentUser.user) {
//     return <Navigate to="/signin" />;
//   }

//   if (loading) {
//     return <div className="text-center p-8">Loading orders...</div>;
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">My Orders</h2>

//       {error && <div className="mb-4 text-red-500">{error}</div>}

//       {orders.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <p>You haven't placed any orders yet.</p>
//           <Link to="/home" className="text-blue-500 hover:text-blue-700 mt-2 inline-block">
//             Browse Menu
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-6">
//           {orders.map(order => (
//             <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <p className="font-semibold">Order #{order.token}</p>
//                   <p className="text-sm text-gray-600">
//                     Status: <span className={`font-medium ${
//                       order.status === 'confirmed' ? 'text-blue-600' :
//                       order.status === 'delivered' ? 'text-green-600' :
//                       order.status === 'out_for_delivery' ? 'text-orange-600' : 'text-yellow-600'
//                     }`}>{order.status}</span>
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Ordered on: {new Date(order.created_at).toLocaleString()}
//                   </p>
//                   {order.delivery_person && (
//                     <p className="text-sm text-gray-600 mt-1">
//                       Delivery Person: <span className="font-medium">{order.delivery_person.name}</span>
//                     </p>
//                   )}
//                 </div>
//                 <p className="font-bold">${order.total_price}</p>
//               </div>

//               <div className="mb-4">
//                 <p className="font-medium">Delivery Address:</p>
//                 <p className="text-sm">{order.address}</p>
//               </div>

//               <Link
//                 to={`/orders/${order.token}`}
//                 className="text-blue-500 hover:text-blue-700"
//               >
//                 View Details
//               </Link>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default MyOrders;
