import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  MapPin,
  Clock,
  Check,
  ArrowLeft,
  Trash2,
  Edit3,
  Package,
  Truck,
} from "lucide-react";
import AuthService from "../services/auth.service";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderToken, setOrderToken] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      navigate("/signin");
      return;
    }

    // Load cart items from localStorage
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    // Fetch user's address from the database
    fetchUserAddress(currentUser.token);
  }, [navigate]);

  const fetchUserAddress = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (response.data && response.data.address) {
        setAddress(response.data.address);
      }
    } catch (err) {
      console.error("Error fetching user address:", err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleSaveAddress = async () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      navigate("/signin");
      return;
    }

    if (saveAsDefault) {
      try {
        // Update the user's default address in the database
        await axios.put(
          "http://localhost:5000/api/users/update-address",
          { address },
          {
            headers: {
              "x-access-token": currentUser.token,
            },
          }
        );
      } catch (err) {
        console.error("Error updating default address:", err);
        setError("Failed to update default address");
      }
    }

    setIsEditingAddress(false);
  };

  const handlePlaceOrder = async () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      navigate("/signin");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!address.trim()) {
      setError("Please provide a delivery address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const total = calculateTotal();
      const orderData = {
        user_id: currentUser.user.id,
        items: cartItems,
        address: address, // Use the address (original or modified)
        total_price: total,
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        {
          headers: {
            "x-access-token": currentUser.token,
          },
        }
      );

      // Store the order details before clearing cart
      setOrderToken(response.data.token);
      setOrderTotal(total);
      setOrderPlaced(true);

      // Clear cart after successful order
      localStorage.removeItem("cart");
      setCartItems([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
      console.error("Error placing order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 py-6 sm:py-8 lg:py-16 xl:py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-full shadow-lg">
                  <Check className="w-8 sm:w-10 lg:w-12 xl:w-16 h-8 sm:h-10 lg:h-12 xl:h-16 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6">
                Order Confirmed!
              </h1>
              <p className="text-green-100 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto">
                Your delicious meal is being prepared and will be delivered soon
              </p>

              {/* Enhanced Delivery Info */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 text-sm sm:text-base lg:text-lg text-green-100">
                <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <span>Delivering to your address</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <span>30-45 min delivery</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Truck className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <span>Free delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
            {/* Order Details - Enhanced for larger screens */}
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 lg:p-10 shadow-2xl">
              <div className="flex items-center mb-6">
                <Package className="w-6 h-6 lg:w-7 lg:h-7 text-orange-500 mr-3" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Order Details</h2>
              </div>
              <div className="space-y-4 lg:space-y-6 text-gray-300">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 p-4 bg-gray-700 rounded-lg">
                  <span className="text-sm sm:text-base lg:text-lg font-medium">Order Token:</span>
                  <span className="font-mono text-orange-400 font-bold text-sm sm:text-base lg:text-lg break-all sm:text-right">
                    {orderToken}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 p-4 bg-gray-700 rounded-lg">
                  <span className="text-sm sm:text-base lg:text-lg font-medium">Delivery Address:</span>
                  <span className="text-sm sm:text-base lg:text-lg sm:text-right sm:max-w-xs lg:max-w-sm break-words">{address}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-white">Total Amount:</span>
                  <span className="font-bold text-white text-lg sm:text-xl lg:text-2xl">
                    ₹{orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Section - Enhanced for larger screens */}
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 lg:p-10 text-center shadow-2xl">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-white">
                Order Verification
              </h3>
              <p className="text-gray-300 mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">
                Show this QR code to your delivery person for verification
              </p>

              <div className="flex justify-center mb-6 lg:mb-8">
                <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg">
                  <QRCodeSVG 
                    value={orderToken} 
                    size={window.innerWidth >= 1024 ? 250 : window.innerWidth >= 640 ? 200 : 150}
                    className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] lg:w-[250px] lg:h-[250px]" 
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm lg:text-base text-gray-400 mb-8 lg:mb-10">
                This QR code contains your order token for secure verification
              </p>

              <button
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 mx-auto text-sm sm:text-base lg:text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => navigate("/home")}
              >
                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Return to Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = AuthService.getCurrentUser();
  if (!currentUser || !currentUser.user) {
    return null; // We'll redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {cartItems.length === 0 ? (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-12 lg:py-20">
          <div className="bg-gray-800 rounded-xl p-8 sm:p-12 lg:p-16 text-center shadow-2xl">
            <div className="flex justify-center mb-6 lg:mb-8">
              <div className="bg-gray-700 p-4 lg:p-6 rounded-full">
                <ShoppingCart className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Your cart is empty</h2>
            <p className="text-gray-400 mb-8 lg:mb-12 text-sm sm:text-base lg:text-lg max-w-md mx-auto">
              Add some delicious items to get started on your culinary journey
            </p>
            <button
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 mx-auto text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => navigate("/home")}
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>Browse Menu</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Cart Header - Desktop Only */}
          <div className="hidden lg:block mb-8 xl:mb-12">
            <div className="text-center">
              <h1 className="text-3xl xl:text-4xl font-bold mb-4">Shopping Cart</h1>
              <p className="text-gray-400 text-lg xl:text-xl">
                Review your order • {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • Total: ₹{calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
            {/* Main Cart Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address Section - Enhanced */}
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
                <div className="flex items-center mb-4 lg:mb-6">
                  <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500 mr-3 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Delivery Address</h3>
                </div>

                {isEditingAddress ? (
                  <div className="space-y-4 lg:space-y-6">
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-4 lg:p-5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base lg:text-lg resize-none"
                      rows="4"
                      placeholder="Enter your complete delivery address with landmarks"
                    />
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="saveAsDefault"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="mr-3 mt-1 w-4 h-4 lg:w-5 lg:h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 flex-shrink-0"
                      />
                      <label htmlFor="saveAsDefault" className="text-gray-300 text-sm sm:text-base lg:text-lg">
                        Save as my default delivery address for future orders
                      </label>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base lg:text-lg flex-1 sm:flex-none shadow-lg hover:shadow-xl"
                        onClick={handleSaveAddress}
                      >
                        Save Address
                      </button>
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base lg:text-lg flex-1 sm:flex-none"
                        onClick={() => {
                          setIsEditingAddress(false);
                          setSaveAsDefault(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-700 p-4 lg:p-5 rounded-xl mb-3 lg:mb-4">
                        <p className="text-gray-300 text-sm sm:text-base lg:text-lg break-words leading-relaxed">
                          {address || "No delivery address provided"}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-500">
                        You can modify this address for this order or update your default address for future deliveries.
                      </p>
                    </div>
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 lg:space-x-3 text-sm sm:text-base lg:text-lg w-full lg:w-auto lg:flex-shrink-0 shadow-lg hover:shadow-xl"
                      onClick={() => setIsEditingAddress(true)}
                    >
                      <Edit3 className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span>{address ? "Change Address" : "Add Address"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Items - Enhanced */}
              <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-700">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Order Items</h3>
                </div>

                <div className="divide-y divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 lg:p-8 hover:bg-gray-750 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                        {/* Item Image & Details */}
                        <div className="flex items-center space-x-4 lg:space-x-6 flex-1 min-w-0">
                          {/* Item Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 sm:w-20 lg:w-24 xl:w-28 h-16 sm:h-20 lg:h-24 xl:h-28 object-cover rounded-xl shadow-md"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/112x112/374151/9CA3AF?text=Food";
                              }}
                            />
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white mb-1 lg:mb-2 truncate">
                              {item.name}
                            </h4>
                            <p className="text-orange-400 font-bold text-sm sm:text-base lg:text-lg xl:text-xl">
                              ₹{item.price} each
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-700 rounded-xl shadow-lg">
                            <button
                              className="p-2 lg:p-3 hover:bg-gray-600 rounded-l-xl transition-colors"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                            <span className="px-4 lg:px-6 py-2 lg:py-3 font-bold min-w-[3rem] lg:min-w-[4rem] text-center text-sm sm:text-base lg:text-lg">
                              {item.quantity}
                            </span>
                            <button
                              className="p-2 lg:p-3 hover:bg-gray-600 rounded-r-xl transition-colors"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right min-w-[5rem] lg:min-w-[7rem]">
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            className="p-2 lg:p-3 text-red-400 hover:text-red-300 hover:bg-red-400 hover:bg-opacity-20 rounded-xl transition-all duration-300"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="w-5 h-5 lg:w-6 lg:h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar - Enhanced */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl sticky top-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Order Summary</h3>

                <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                  <div className="flex justify-between text-gray-300 text-sm sm:text-base lg:text-lg">
                    <span>
                      Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                    </span>
                    <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
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
                      <span>Total</span>
                      <span className="text-orange-400">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 sm:px-6 lg:px-8 py-4 lg:py-5 rounded-xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 flex items-center justify-center space-x-2 lg:space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  onClick={handlePlaceOrder}
                  disabled={loading || !address.trim()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-b-2 border-white"></div>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>

                {!address.trim() && !isEditingAddress && (
                  <p className="mt-3 lg:mt-4 text-red-400 text-xs sm:text-sm lg:text-base text-center font-medium">
                    Please add a delivery address to continue
                  </p>
                )}

                {error && (
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl">
                    <p className="text-red-400 text-xs sm:text-sm lg:text-base font-medium">{error}</p>
                  </div>
                )}

                {/* Additional Info for larger screens */}
                <div className="hidden lg:block mt-8 pt-6 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-3">
                      🚚 Free delivery on all orders
                    </p>
                    <p className="text-gray-400 text-sm mb-3">
                      ⏰ Estimated delivery: 30-45 minutes
                    </p>
                    <p className="text-gray-400 text-sm">
                      🔒 Secure payment processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;