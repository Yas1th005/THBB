import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, MapPin } from "lucide-react";
import AuthService from "../services/auth.service";
import axios from "axios";

function AdminCart() {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState("Restaurant Kitchen - Internal Order");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderToken, setOrderToken] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("adminCart") || "[]");
    setCartItems(cart);
  }, []);

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
    localStorage.setItem("adminCart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("adminCart", JSON.stringify(updatedCart));
  };

  const handlePlaceOrder = async () => {
    if (!currentUser || !currentUser.token) {
      navigate("/signin");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const total = calculateTotal();
      const orderData = {
        user_id: currentUser.user.id,
        items: cartItems,
        address: address,
        total_price: total,
      };

      const response = await axios.post(
        "https://thbb.onrender.com/api/orders",
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

      // Clear admin cart after successful order
      localStorage.removeItem("adminCart");
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
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-gray-800 rounded-xl p-8 text-center shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 p-4 rounded-full">
                <ShoppingCart className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-400">
              Restaurant Order Placed Successfully!
            </h2>
            <p className="text-gray-300 mb-6">
              Your internal restaurant order has been placed and will be prepared by the kitchen.
            </p>
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Order Token:</p>
              <p className="text-xl font-mono font-bold text-orange-500">#{orderToken}</p>
              <p className="text-sm text-gray-400 mt-2">Total: ₹{orderTotal.toFixed(2)}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                onClick={() => navigate("/admin")}
              >
                Back to Dashboard
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                onClick={() => {
                  setOrderPlaced(false);
                  setOrderToken("");
                  setOrderTotal(0);
                }}
              >
                Place Another Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {cartItems.length === 0 ? (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-gray-800 rounded-xl p-8 text-center shadow-2xl">
            <button
              className="flex items-center text-orange-500 hover:text-orange-400 mb-6 transition-colors"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex justify-center mb-6">
              <div className="bg-gray-700 p-6 rounded-full">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Your admin cart is empty</h2>
            <p className="text-gray-400 mb-8">
              Add some items from the Order Food section to get started
            </p>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/admin")}
            >
              Browse Menu
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              className="flex items-center text-orange-500 hover:text-orange-400 mb-4 transition-colors"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Restaurant Order Cart</h1>
              <p className="text-gray-400 text-lg">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • Total: ₹{calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-xl">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-bold flex items-center">
                    <ShoppingCart className="w-6 h-6 mr-3 text-orange-500" />
                    Order Items
                  </h3>
                </div>

                <div className="divide-y divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {item.name}
                          </h4>
                          <p className="text-orange-500 font-bold text-lg">
                            ₹{item.price} each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-700 rounded-lg">
                          <button
                            className="p-2 hover:bg-gray-600 rounded-l-lg transition-colors"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            className="p-2 hover:bg-gray-600 rounded-r-lg transition-colors"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl sticky top-8">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-orange-500" />
                  Order Summary
                </h3>

                {/* Delivery Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Delivery Location
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter delivery location within restaurant..."
                  />
                </div>

                {/* Order Total */}
                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Subtotal:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-orange-500 mt-2">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  onClick={handlePlaceOrder}
                  disabled={loading || !address.trim()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      <span>Place Restaurant Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCart;
