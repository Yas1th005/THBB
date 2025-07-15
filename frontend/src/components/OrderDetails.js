import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Package,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Truck,
  AlertCircle,
  ArrowLeft,
  Receipt,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import axios from "axios";
import AuthService from "../services/auth.service";
import { QRCodeSVG } from "qrcode.react";

function OrderDetails() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (!currentUser || !currentUser.token) {
      return;
    }
    fetchOrderDetails();
  }, [token]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `https://thbb.onrender.com/api/orders/token/${token}`,
        {
          headers: {
            "x-access-token": currentUser.token,
          },
        }
      );

      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch order details");
      setLoading(false);
      console.error("Error fetching order details:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />;
      case "out_for_delivery":
        return <Truck className="w-5 h-5 lg:w-6 lg:h-6 text-orange-400" />;
      case "pending":
        return <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-blue-400 bg-blue-500 bg-opacity-20";
      case "delivered":
        return "text-green-400 bg-green-500 bg-opacity-20";
      case "out_for_delivery":
        return "text-orange-400 bg-orange-500 bg-opacity-20";
      case "pending":
        return "text-yellow-400 bg-yellow-500 bg-opacity-20";
      default:
        return "text-red-400 bg-red-500 bg-opacity-20";
    }
  };

  const formatStatus = (status) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!currentUser || !currentUser.token) {
    return <Navigate to="/signin" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center text-red-400 p-6 sm:p-8 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4" />
          <p className="text-lg sm:text-xl lg:text-2xl mb-4 font-semibold">Oops! Something went wrong</p>
          <p className="text-sm sm:text-base lg:text-lg mb-6">{error}</p>
          <Link
            to="/orders"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center text-gray-400 p-6 sm:p-8 max-w-md mx-auto">
          <Package className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4" />
          <p className="text-lg sm:text-xl lg:text-2xl mb-4 font-semibold text-white">Order not found</p>
          <p className="text-sm sm:text-base lg:text-lg mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/orders"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Enhanced Hero Section */}
      {/* <div className="bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 py-6 sm:py-8 lg:py-16 xl:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-full shadow-lg">
                <Package className="w-8 sm:w-10 lg:w-12 xl:w-16 h-8 sm:h-10 lg:h-12 xl:h-16 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6">
              Order Details
            </h1>
            <p className="text-orange-100 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto">
              Track your order and view complete details
            </p>

            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full inline-block">
              <span className="font-mono text-sm sm:text-base lg:text-lg xl:text-xl font-bold">
                Order #{order.token}
              </span>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back Button - Mobile Visible */}
        <div className="mb-6 lg:mb-8">
          <Link
            to="/my-orders"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2 text-sm sm:text-base shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Order Status Card */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
              <div className="flex items-center mb-4 lg:mb-6">
                <Receipt className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500 mr-3" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Order Status</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {/* Status Badge */}
                <div className={`p-4 lg:p-6 rounded-xl ${getStatusColor(order.status)}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(order.status)}
                    <span className="font-bold text-sm sm:text-base lg:text-lg">
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base opacity-80">
                    Current order status
                  </p>
                </div>

                {/* Order Date */}
                <div className="p-4 lg:p-6 bg-gray-700 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                    <span className="font-bold text-sm sm:text-base lg:text-lg text-white">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-400">
                    Order placed on {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Delivery Person Info */}
              {order.delivery_person && (
                <div className="mt-4 lg:mt-6 p-4 lg:p-6 bg-blue-500 bg-opacity-20 rounded-xl border border-blue-500 border-opacity-30">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                    <span className="font-bold text-sm sm:text-base lg:text-lg text-white">
                      {order.delivery_person.name}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base text-blue-200">
                    Your delivery person
                  </p>
                  {order.delivery_person.phone && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span className="text-xs sm:text-sm text-blue-200">
                        {order.delivery_person.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
              <div className="flex items-center mb-4 lg:mb-6">
                <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500 mr-3" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Delivery Address</h2>
              </div>
              <div className="bg-gray-700 p-4 lg:p-6 rounded-xl">
                <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed break-words">
                  {order.address}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-700">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Order Items</h2>
              </div>

              <div className="divide-y divide-gray-700">
                {order.items.map((item, index) => (
                  <div key={item.id || index} className="p-4 sm:p-6 lg:p-8 hover:bg-gray-750 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                      {/* Item Image & Details */}
                      <div className="flex items-center space-x-4 lg:space-x-6 flex-1 min-w-0">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.menu_item?.image_url}
                            alt={item.menu_item?.name || 'Food item'}
                            className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 object-cover rounded-xl shadow-md"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/96x96/374151/9CA3AF?text=Food";
                            }}
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 lg:mb-2 truncate">
                            {item.menu_item?.name || 'Unknown Item'}
                          </h3>
                          <p className="text-orange-400 font-semibold text-sm sm:text-base lg:text-lg">
                            ₹{item.price_at_time} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-8">
                        {/* Quantity */}
                        <div className="text-center">
                          <div className="bg-gray-700 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-xl">
                            <span className="font-bold text-sm sm:text-base lg:text-lg">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white">
                            ₹{(item.price_at_time * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            Subtotal
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            {/* Order Summary */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl sticky top-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Order Summary</h3>

              <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                <div className="flex justify-between text-gray-300 text-sm sm:text-base lg:text-lg">
                  <span>
                    Subtotal ({order.items.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </span>
                  <span className="font-semibold">₹{order.total_price}</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm sm:text-base lg:text-lg">
                  <span>Delivery Fee</span>
                  <span className="text-green-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm sm:text-base lg:text-lg">
                  <span>Taxes & Fees</span>
                  <span className="text-green-400 font-semibold">Included</span>
                </div>
                <div className="border-t border-gray-700 pt-3 lg:pt-4">
                  <div className="flex justify-between text-xl sm:text-2xl lg:text-3xl font-bold">
                    <span>Total Paid</span>
                    <span className="text-orange-400">₹{order.total_price}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 lg:space-y-4">
                <Link
                  to="/orders"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl"
                >
                  <Package className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>View All Orders</span>
                </Link>

                <Link
                  to="/home"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base lg:text-lg"
                >
                  <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Browse Menu</span>
                </Link>
              </div>

              {/* Status Timeline - Desktop Only */}
              <div className="hidden lg:block mt-8 pt-6 border-t border-gray-700">
                <h4 className="font-semibold mb-4 text-lg">Order Timeline</h4>
                <div className="space-y-3">
                  <div className={`flex items-center space-x-3 ${order.status !== 'pending' ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status !== 'pending' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">Order Placed</span>
                  </div>
                  <div className={`flex items-center space-x-3 ${order.status === 'confirmed' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'confirmed' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">Order Confirmed</span>
                  </div>
                  <div className={`flex items-center space-x-3 ${order.status === 'out_for_delivery' || order.status === 'delivered' ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">Out for Delivery</span>
                  </div>
                  <div className={`flex items-center space-x-3 ${order.status === 'delivered' ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">Delivered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 text-center shadow-xl">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-white">
                  Order Verification
                </h3>
                <p className="text-gray-300 mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">
                  Show this QR code to your delivery person
                </p>

                <div className="flex justify-center mb-6 lg:mb-8">
                  <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg">
                    <QRCodeSVG 
                      value={order.token} 
                      size={window.innerWidth >= 1024 ? 200 : window.innerWidth >= 640 ? 180 : 150}
                      className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px]" 
                    />
                  </div>
                </div>

                <p className="text-xs sm:text-sm lg:text-base text-gray-400">
                  Token: <span className="font-mono text-orange-400">{order.token}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;























// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import AuthService from "../services/auth.service";
// import { QRCodeSVG } from "qrcode.react";

// function OrderDetails() {
//   const { token } = useParams();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const currentUser = AuthService.getCurrentUser();

//   useEffect(() => {
//     fetchOrderDetails();
//   }, []);

//   const fetchOrderDetails = async () => {
//     try {
//       const response = await axios.get(
//         `https://thbb.onrender.com/api/orders/token/${token}`,
//         {
//           headers: {
//             "x-access-token": currentUser.token,
//           },
//         }
//       );

//       setOrder(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to fetch order details");
//       setLoading(false);
//       console.error("Error fetching order details:", err);
//     }
//   };

//   if (loading) {
//     return <div className="text-center p-8">Loading order details...</div>;
//   }

//   if (error) {
//     return <div className="text-center p-8 text-red-500">{error}</div>;
//   }

//   if (!order) {
//     return <div className="text-center p-8">Order not found</div>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold">Order Details</h2>
//         <Link to="/orders" className="text-blue-500 hover:text-blue-700">
//           Back to Orders
//         </Link>
//       </div>

//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="flex justify-between items-start mb-4">
//           <div>
//             <p className="font-semibold">Order #{order.token}</p>
//             <p className="text-sm text-gray-600">
//               Status:{" "}
//               <span
//                 className={`font-medium ${
//                   order.status === "pending"
//                     ? "text-yellow-600"
//                     : order.status === "confirmed"
//                     ? "text-blue-600"
//                     : order.status === "delivered"
//                     ? "text-green-600"
//                     : order.status === "out_for_delivery"
//                     ? "text-orange-600"
//                     : "text-red-600"
//                 }`}
//               >
//                 {order.status}
//               </span>
//             </p>
//             <p className="text-sm text-gray-600">
//               Ordered on: {new Date(order.created_at).toLocaleString()}
//             </p>
//           </div>
//           <p className="font-bold">₹{order.total_price}</p>
//         </div>

//         <div className="mb-4">
//           <p className="font-medium">Delivery Address:</p>
//           <p className="text-sm">{order.address}</p>
//         </div>
//       </div>

//       <div className="mt-6">
//         <h3 className="text-lg font-semibold mb-3">Order Items</h3>
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Item
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Quantity
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Price
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Subtotal
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {order.items.map((item) => (
//                 <tr key={item.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       {item.menu_item.image_url && (
//                         <div className="flex-shrink-0 h-10 w-10 mr-4">
//                           <img
//                             className="h-10 w-10 rounded-full"
//                             src={item.menu_item.image_url}
//                             alt={item.menu_item.name}
//                           />
//                         </div>
//                       )}
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {item.menu_item.name}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {item.quantity}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     ₹{item.price_at_time}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     ₹{(item.price_at_time * item.quantity).toFixed(2)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {order.status !== "delivered" && order.status !== "cancelled" && (
//         <div className="mt-8 border-t pt-6">
//           <h3 className="text-lg font-semibold mb-3">Order QR Code</h3>
//           <div className="flex flex-col items-center">
//             <p className="mb-2 text-sm text-gray-600">
//               Show this QR code to your delivery person for verification:
//             </p>
//             <div className="p-4 bg-white border border-gray-300 rounded-lg">
//               <QRCodeSVG value={order.token} size={200} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default OrderDetails;
