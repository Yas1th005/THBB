import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, User, LogOut, Star, Clock, MapPin, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import AuthService from '../services/auth.service';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Categories could be dynamic based on menu items
  const categories = ['All', 'Pizza', 'Burgers', 'Salads', 'Pasta', 'Mexican', 'Desserts'];
  
  // Today's specials (can be filtered from menuItems based on a special flag)
  const [todaysSpecials, setTodaysSpecials] = useState([]);
  
  const handleLogout = () => {
    AuthService.logout();
    navigate('/signin');
  };
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/menu');
        const items = response.data;
        setMenuItems(items);
        
        // Filter today's specials (assuming items have isSpecial flag or random selection)
        const specials = items.filter(item => item.isSpecial || Math.random() > 0.7).slice(0, 5);
        setTodaysSpecials(specials.length > 0 ? specials : items.slice(0, 3));
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load menu items');
        setLoading(false);
        console.error('Error fetching menu:', err);
      }
    };
    
    fetchMenu();
    updateCartCount();
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    if (todaysSpecials.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % todaysSpecials.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [todaysSpecials.length]);
  
  if (!currentUser || !currentUser.user) {
    return <Navigate to="/signin" />;
  }
  
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  };

  const handleAddToCart = (item, quantity) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      imageUrl: item.imageUrl
    };
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    updateCartCount();
    
    // Dispatch custom event for cart changes
    window.dispatchEvent(new Event('cart-change'));
    
    // Show success feedback
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300';
    notification.textContent = `Added ${quantity} ${item.name} to cart`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % todaysSpecials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + todaysSpecials.length) % todaysSpecials.length);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading delicious food...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400 p-8">
          <p className="text-xl mb-4">Oops! Something went wrong</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      {/* <div className="bg-gradient-to-r from-orange-600 to-red-600 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Delicious Food, Delivered Fast</h1>
            <p className="text-orange-100 mb-4 sm:mb-6 text-sm sm:text-base">Order your favorite meals from the comfort of your home</p>
            

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-orange-100">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Downtown Area</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>30 min delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Today's Specials Carousel */}
      {todaysSpecials.length > 0 && (
        <div className="bg-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2" />
              <h2 className="text-xl sm:text-2xl font-bold text-center">Today's Specials</h2>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {todaysSpecials.map((item, index) => (
                    <div key={item.id} className="w-full flex-shrink-0">
                      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl overflow-hidden mx-2 sm:mx-4">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-1/2">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-48 sm:h-64 object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300/374151/9CA3AF?text=Food+Image';
                              }}
                            />
                          </div>
                          <div className="sm:w-1/2 p-4 sm:p-6 flex flex-col justify-center">
                            <div className="flex items-center mb-2">
                              <span className="bg-orange-500 text-xs px-2 py-1 rounded-full font-medium mr-2">SPECIAL</span>
                              {item.rating && (
                                <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                                  <span>{item.rating}</span>
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg sm:text-2xl font-bold mb-2">{item.name}</h3>
                            <p className="text-gray-300 text-sm sm:text-base mb-4 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl sm:text-2xl font-bold text-orange-500">${item.price}</span>
                              <button 
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm sm:text-base"
                                onClick={() => handleAddToCart(item, 1)}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel Navigation */}
              {todaysSpecials.length > 1 && (
                <>
                  <button 
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
              
              {/* Carousel Indicators */}
              {todaysSpecials.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {todaysSpecials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-orange-500' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search for food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm sm:text-base"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-4 sm:mb-6 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 sm:px-4 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Our Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuItem 
              key={item.id} 
              item={item} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">No items found</p>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02]">
      <div className="relative">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-40 sm:h-48 lg:h-52 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/374151/9CA3AF?text=Food+Image';
          }}
        />
        {item.rating && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black bg-opacity-70 px-2 py-1 rounded-full">
            <div className="flex items-center space-x-1 text-yellow-400 text-xs sm:text-sm">
              <Star className="w-3 h-3 fill-current" />
              <span>{item.rating}</span>
            </div>
          </div>
        )}
        {item.isSpecial && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-orange-500 px-2 py-1 rounded-full">
            <span className="text-white text-xs font-medium">SPECIAL</span>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white line-clamp-1 flex-1">{item.name}</h3>
          <span className="text-orange-500 font-bold text-base sm:text-lg ml-2">${item.price}</span>
        </div>
        
        <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">{item.description}</p>
        
        {item.prepTime && (
          <div className="flex items-center text-gray-500 text-xs mb-3 sm:mb-4">
            <Clock className="w-3 h-3 mr-1" />
            <span>{item.prepTime}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center bg-gray-700 rounded-lg">
            <button 
              className="p-1.5 sm:p-2 hover:bg-gray-600 rounded-l-lg transition-colors"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <span className="px-2 sm:px-3 py-1.5 sm:py-2 font-medium min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm">{quantity}</span>
            <button 
              className="p-1.5 sm:p-2 hover:bg-gray-600 rounded-r-lg transition-colors"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Add to Cart Button */}
          <button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            onClick={() => onAddToCart(item, quantity)}
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Add to Cart</span>
            <span className="xs:hidden sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;














// import React, { useState, useEffect } from 'react';
// import AuthService from '../services/auth.service';
// import { Navigate, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function Home() {
//   const navigate = useNavigate();
//   const currentUser = AuthService.getCurrentUser();
//   const [menuItems, setMenuItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Add logout handler
//   const handleLogout = () => {
//     AuthService.logout();
//     navigate('/signin');
//   };
  
//   useEffect(() => {
//     const fetchMenu = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/menu');
//         setMenuItems(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load menu items');
//         setLoading(false);
//         console.error('Error fetching menu:', err);
//       }
//     };
    
//     fetchMenu();
//   }, []);
  
//   if (!currentUser || !currentUser.user) {
//     return <Navigate to="/signin" />;
//   }

//   const handleAddToCart = (item, quantity) => {
//     const cartItem = {
//       id: item.id,
//       name: item.name,
//       price: item.price,
//       quantity: quantity
//     };
    
//     // Get existing cart or initialize empty array
//     const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
//     // Check if item already exists in cart
//     const existingItemIndex = existingCart.findIndex(i => i.id === item.id);
    
//     if (existingItemIndex >= 0) {
//       // Update quantity if item exists
//       existingCart[existingItemIndex].quantity += quantity;
//     } else {
//       // Add new item if it doesn't exist
//       existingCart.push(cartItem);
//     }
    
//     // Save updated cart to localStorage
//     localStorage.setItem('cart', JSON.stringify(existingCart));
    
//     // Show feedback to user
//     alert(`Added ${quantity} of ${item.name} to cart`);
//   };

//   if (loading) return <div className="text-center p-8">Loading menu...</div>;
//   if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold">Food Menu</h2>
//         <button 
//           onClick={handleLogout}
//           className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//         >
//           Logout
//         </button>
//       </div>
//       <p className="mb-6">Welcome, <span className="font-semibold">{currentUser.user.name}</span>!</p>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {menuItems.map((item) => (
//           <MenuItem 
//             key={item.id} 
//             item={item} 
//             onAddToCart={handleAddToCart} 
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function MenuItem({ item, onAddToCart }) {
//   const [quantity, setQuantity] = useState(1);
  
//   return (
//     <div className="border rounded-lg overflow-hidden shadow-md bg-white">
//       <img 
//         src={item.imageUrl} 
//         alt={item.name} 
//         className="w-full h-48 object-cover"
//         onError={(e) => {
//           e.target.src = 'https://via.placeholder.com/300x200?text=Food+Image';
//         }}
//       />
//       <div className="p-4">
//         <div className="flex justify-between items-start mb-2">
//           <h3 className="text-xl font-semibold">{item.name}</h3>
//           <span className="text-green-600 font-bold">${item.price}</span>
//         </div>
//         <p className="text-gray-600 mb-4">{item.description}</p>
        
//         <div className="flex items-center justify-between">
//           <div className="flex items-center border rounded">
//             <button 
//               className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
//               onClick={() => setQuantity(Math.max(1, quantity - 1))}
//             >
//               -
//             </button>
//             <span className="px-3 py-1">{quantity}</span>
//             <button 
//               className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
//               onClick={() => setQuantity(quantity + 1)}
//             >
//               +
//             </button>
//           </div>
          
//           <button 
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//             onClick={() => onAddToCart(item, quantity)}
//           >
//             Add to Cart
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;




