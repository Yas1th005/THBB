import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, MapPin, Clock, Check, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import AuthService from '../services/auth.service';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderToken, setOrderToken] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      navigate('/signin');
      return;
    }

    // Load cart items from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    
    // Fetch user's address from the database
    fetchUserAddress(currentUser.token);
  }, [navigate]);

  const fetchUserAddress = async (token) => {
    try {
      console.log('Fetching user address...');
      const response = await axios.get(
        'http://localhost:5000/api/users/profile',
        {
          headers: {
            'x-access-token': token
          }
        }
      );
      
      console.log('User profile response:', response.data);
      
      if (response.data && response.data.address) {
        setAddress(response.data.address);
        console.log('Address set to:', response.data.address);
      } else {
        console.log('No address found in user profile');
      }
    } catch (err) {
      console.error('Error fetching user address:', err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? {...item, quantity: newQuantity} : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleSaveAddress = async () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      navigate('/signin');
      return;
    }

    if (saveAsDefault) {
      try {
        // Update the user's default address in the database
        await axios.put(
          'http://localhost:5000/api/users/update-address',
          { address },
          {
            headers: {
              'x-access-token': currentUser.token
            }
          }
        );
        console.log('Default address updated successfully');
      } catch (err) {
        console.error('Error updating default address:', err);
        setError('Failed to update default address');
      }
    }

    setIsEditingAddress(false);
  };

  const handlePlaceOrder = async () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      navigate('/signin');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    if (!address.trim()) {
      setError('Please provide a delivery address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        user_id: currentUser.user.id,
        items: cartItems,
        address: address, // Use the address (original or modified)
        total_price: calculateTotal()
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        {
          headers: {
            'x-access-token': currentUser.token
          }
        }
      );

      setOrderToken(response.data.token);
      setOrderPlaced(true);
      
      // Clear cart after successful order
      localStorage.removeItem('cart');
      setCartItems([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">Your delicious meal is on its way</p>
              
              {/* Delivery Info */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-green-100">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Delivering to your address</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>30-45 min delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">Order Details</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Order Token:</span>
                <span className="font-mono text-orange-400 font-semibold">{orderToken}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Address:</span>
                <span className="text-right max-w-xs">{address}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-orange-400">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* QR Code Section */}
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 text-center">
            <h3 className="text-lg font-semibold mb-4 text-white">Order Verification</h3>
            <p className="text-gray-300 mb-6">Show this QR code to your delivery person for verification</p>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={orderToken} size={200} />
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-8">This QR code contains your order token for secure verification</p>
            
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Menu</span>
            </button>
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
      {/* Hero Section */}
      {/* <div className="bg-gradient-to-r from-orange-600 to-red-600 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Your Cart</h1>
            <p className="text-orange-100 mb-4 sm:mb-6 text-sm sm:text-base">Review your order before checkout</p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-orange-100">
              <div className="flex items-center space-x-1">
                <span>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
              </div>
              {cartItems.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span>Total: ${calculateTotal().toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div> */}
      
      {cartItems.length === 0 ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-700 p-4 rounded-full">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some delicious items to get started</p>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Menu</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Delivery Address Section */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-orange-500 mr-2" />
              <h3 className="text-xl font-semibold">Delivery Address</h3>
            </div>
            
            {isEditingAddress ? (
              <div className="space-y-4">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  rows="3"
                  placeholder="Enter your delivery address"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveAsDefault"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="mr-2 w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="saveAsDefault" className="text-gray-300">Save as my default address</label>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={handleSaveAddress}
                  >
                    Save
                  </button>
                  <button 
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-300 mb-2">{address || "No address provided"}</p>
                  <p className="text-sm text-gray-500">
                    You can change this address for this order or update your default address.
                  </p>
                </div>
                <button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-4"
                  onClick={() => setIsEditingAddress(true)}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{address ? "Change" : "Add Address"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold">Order Items</h3>
            </div>
            
            <div className="divide-y divide-gray-700">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex items-center space-x-4">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64/374151/9CA3AF?text=Food';
                      }}
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-white truncate">{item.name}</h4>
                    <p className="text-orange-400 font-semibold">${item.price}</p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-gray-700 rounded-lg">
                    <button 
                      className="p-2 hover:bg-gray-600 rounded-l-lg transition-colors"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{item.quantity}</span>
                    <button 
                      className="p-2 hover:bg-gray-600 rounded-r-lg transition-colors"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Subtotal */}
                  <div className="text-right min-w-[6rem]">
                    <p className="text-lg font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition-colors"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery Fee</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-orange-400">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button 
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
              onClick={handlePlaceOrder}
              disabled={loading || !address.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Place Order</span>
                </>
              )}
            </button>
            
            {!address.trim() && !isEditingAddress && (
              <p className="mt-3 text-red-400 text-sm text-center">Please add a delivery address to continue</p>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;







// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AuthService from '../services/auth.service';
// import axios from 'axios';
// import { QRCodeSVG } from 'qrcode.react';

// function Cart() {
//   const navigate = useNavigate();
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [address, setAddress] = useState('');
//   const [isEditingAddress, setIsEditingAddress] = useState(false);
//   const [orderPlaced, setOrderPlaced] = useState(false);
//   const [orderToken, setOrderToken] = useState('');
//   const [saveAsDefault, setSaveAsDefault] = useState(false);

//   useEffect(() => {
//     // Check if user is logged in
//     const currentUser = AuthService.getCurrentUser();
//     if (!currentUser || !currentUser.token) {
//       navigate('/signin');
//       return;
//     }

//     // Load cart items from localStorage
//     const storedCart = localStorage.getItem('cart');
//     if (storedCart) {
//       setCartItems(JSON.parse(storedCart));
//     }
    
//     // Fetch user's address from the database
//     fetchUserAddress(currentUser.token);
//   }, [navigate]);

//   const fetchUserAddress = async (token) => {
//     try {
//       console.log('Fetching user address...');
//       const response = await axios.get(
//         'http://localhost:5000/api/users/profile',
//         {
//           headers: {
//             'x-access-token': token
//           }
//         }
//       );
      
//       console.log('User profile response:', response.data);
      
//       if (response.data && response.data.address) {
//         setAddress(response.data.address);
//         console.log('Address set to:', response.data.address);
//       } else {
//         console.log('No address found in user profile');
//       }
//     } catch (err) {
//       console.error('Error fetching user address:', err);
//     }
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };

//   const handleQuantityChange = (itemId, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     const updatedCart = cartItems.map(item => 
//       item.id === itemId ? {...item, quantity: newQuantity} : item
//     );
//     setCartItems(updatedCart);
//     localStorage.setItem('cart', JSON.stringify(updatedCart));
//   };

//   const handleRemoveItem = (itemId) => {
//     const updatedCart = cartItems.filter(item => item.id !== itemId);
//     setCartItems(updatedCart);
//     localStorage.setItem('cart', JSON.stringify(updatedCart));
//   };

//   const handleSaveAddress = async () => {
//     const currentUser = AuthService.getCurrentUser();
//     if (!currentUser || !currentUser.token) {
//       navigate('/signin');
//       return;
//     }

//     if (saveAsDefault) {
//       try {
//         // Update the user's default address in the database
//         await axios.put(
//           'http://localhost:5000/api/users/update-address',
//           { address },
//           {
//             headers: {
//               'x-access-token': currentUser.token
//             }
//           }
//         );
//         console.log('Default address updated successfully');
//       } catch (err) {
//         console.error('Error updating default address:', err);
//         setError('Failed to update default address');
//       }
//     }

//     setIsEditingAddress(false);
//   };

//   const handlePlaceOrder = async () => {
//     const currentUser = AuthService.getCurrentUser();
//     if (!currentUser || !currentUser.token) {
//       navigate('/signin');
//       return;
//     }

//     if (cartItems.length === 0) {
//       setError('Your cart is empty');
//       return;
//     }
    
//     if (!address.trim()) {
//       setError('Please provide a delivery address');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const orderData = {
//         user_id: currentUser.user.id,
//         items: cartItems,
//         address: address, // Use the address (original or modified)
//         total_price: calculateTotal()
//       };

//       const response = await axios.post(
//         'http://localhost:5000/api/orders',
//         orderData,
//         {
//           headers: {
//             'x-access-token': currentUser.token
//           }
//         }
//       );

//       setOrderToken(response.data.token);
//       setOrderPlaced(true);
      
//       // Clear cart after successful order
//       localStorage.removeItem('cart');
//       setCartItems([]);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to place order');
//       console.error('Error placing order:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (orderPlaced) {
//     return (
//       <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-4 text-green-600">Order Confirmed!</h2>
//         <p className="mb-4">Your order has been placed successfully.</p>
//         <p className="mb-4">Order Token: <span className="font-bold">{orderToken}</span></p>
//         <p className="mb-4">We'll deliver to: <span className="font-semibold">{address}</span></p>
        
//         {/* QR Code for the order token */}
//         <div className="mb-6 flex flex-col items-center">
//           <p className="mb-2 font-medium">Show this QR code to your delivery person:</p>
//           <div className="p-4 bg-white border border-gray-300 rounded-lg">
//             <QRCodeSVG value={orderToken} size={200} />
//           </div>
//           <p className="mt-2 text-sm text-gray-600">This QR code contains your order token for verification</p>
//         </div>
        
//         <button 
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//           onClick={() => navigate('/home')}
//         >
//           Return to Menu
//         </button>
//       </div>
//     );
//   }

//   const currentUser = AuthService.getCurrentUser();
//   if (!currentUser || !currentUser.user) {
//     return null; // We'll redirect in useEffect
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <h2 className="text-3xl font-bold mb-6">Your Cart</h2>
      
//       {cartItems.length === 0 ? (
//         <div className="text-center p-8">
//           <p className="mb-4">Your cart is empty</p>
//           <button 
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//             onClick={() => navigate('/home')}
//           >
//             Browse Menu
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
//             {isEditingAddress ? (
//               <div>
//                 <textarea
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded mb-2"
//                   rows="3"
//                   placeholder="Enter your delivery address"
//                 />
//                 <div className="flex items-center mb-4">
//                   <input
//                     type="checkbox"
//                     id="saveAsDefault"
//                     checked={saveAsDefault}
//                     onChange={(e) => setSaveAsDefault(e.target.checked)}
//                     className="mr-2"
//                   />
//                   <label htmlFor="saveAsDefault">Save as my default address</label>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button 
//                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
//                     onClick={handleSaveAddress}
//                   >
//                     Save
//                   </button>
//                   <button 
//                     className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
//                     onClick={() => {
//                       setIsEditingAddress(false);
//                       setSaveAsDefault(false);
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex justify-between items-start">
//                 <p className="mb-2">{address || "No address provided"}</p>
//                 <button 
//                   className="text-blue-500 hover:text-blue-700"
//                   onClick={() => setIsEditingAddress(true)}
//                 >
//                   {address ? "Change" : "Add Address"}
//                 </button>
//               </div>
//             )}
//             {!isEditingAddress && (
//               <p className="text-sm text-gray-500 mt-2">
//                 You can change this address for this order or update your default address.
//               </p>
//             )}
//           </div>

//           <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {cartItems.map((item) => (
//                   <tr key={item.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">{item.name}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">${item.price}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center border rounded w-24">
//                         <button 
//                           className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
//                           onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                         >
//                           -
//                         </button>
//                         <span className="px-2 py-1 flex-1 text-center">{item.quantity}</span>
//                         <button 
//                           className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
//                           onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                         >
//                           +
//                         </button>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <button 
//                         className="text-red-600 hover:text-red-900"
//                         onClick={() => handleRemoveItem(item.id)}
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="flex justify-between mb-2">
//               <span className="font-semibold">Total:</span>
//               <span className="font-bold">${calculateTotal().toFixed(2)}</span>
//             </div>
            
//             <button 
//               className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
//               onClick={handlePlaceOrder}
//               disabled={loading || !address.trim()}
//             >
//               {loading ? 'Processing...' : 'Place Order'}
//             </button>
            
//             {!address.trim() && !isEditingAddress && (
//               <p className="mt-2 text-red-500 text-sm">Please add a delivery address</p>
//             )}
            
//             {error && <div className="mt-4 text-red-500">{error}</div>}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default Cart;






