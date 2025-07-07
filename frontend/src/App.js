import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Home as HomeIcon } from 'lucide-react';

// Components
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import DeliveryDashboard from './components/DeliveryDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './components/Cart';
import MyOrders from './components/MyOrders';

// Services
import AuthService from './services/auth.service';
import AddMain from './components/AddMain';

function App() {
  const [currentUser, setCurrentUser] = useState(undefined);
  // const [cartCount, setCartCount] = useState(0);

  // Function to update current user state
  const updateCurrentUser = () => {
    const user = AuthService.getCurrentUser();
    if (user && user.user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(undefined);
    }
  };

  // Function to update cart count
  // const updateCartCount = () => {
  //   const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  //   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  //   setCartCount(totalItems);
  // };

  useEffect(() => {
    // Initial check for user
    updateCurrentUser();
  }, []);

  // useEffect(() => {
  //   // Update cart count whenever user changes
  //   if (currentUser && currentUser.user && currentUser.user.role === 'customer') {
  //     updateCartCount();
  //   } else {
  //     setCartCount(0);
  //   }
  // }, [currentUser]);

  useEffect(() => {
    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        updateCurrentUser();
      }
    };

    const handleAuthChange = () => {
      updateCurrentUser();
    };



    // Set up event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    // window.addEventListener('cart-change', handleCartChange);
    
    // Also listen for focus events to update cart when returning to tab/page
    // window.addEventListener('focus', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      // window.removeEventListener('cart-change', handleCartChange);
      // window.removeEventListener('focus', updateCartCount);
    };
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    window.location.href = '/signin'; // Force a page reload to clear any state
  };

  return (
    <Router>
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 sticky top-0 z-40 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2 text-white no-underline hover:text-orange-400 transition-colors">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-bold text-lg hidden sm:block">FoodieExpress</span>
                </Link>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center space-x-3">
                {currentUser && currentUser.user ? (
                  <>
                    {/* User Info */}
                    <div className="hidden md:flex items-center space-x-2 text-gray-300">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Hi, {currentUser.user.name}</span>
                      <span className="text-xs text-gray-500 capitalize">({currentUser.user.role})</span>
                    </div>
                    
                    {/* Customer Navigation */}
                    {currentUser.user.role === 'customer' && (
                      <>
                        <Link 
                          to="/home" 
                          className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center space-x-1"
                          title="Home"
                        >
                          <HomeIcon className="w-5 h-5" />
                          <span className="hidden sm:inline text-sm">Home</span>
                        </Link>
                        
                        <Link 
                          to="/cart" 
                          className="relative p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center space-x-1"
                          title="Cart"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span className="hidden sm:inline text-sm">Cart</span>
                        </Link>
                        
                        <Link 
                          to="/my-orders" 
                          className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm hidden sm:block"
                        >
                          My Orders
                        </Link>
                      </>
                    )}
                    
                    {/* Admin/Delivery Navigation */}
                    {currentUser.user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
                      >
                        Dashboard
                      </Link>
                    )}
                    
                    {currentUser.user.role === 'delivery' && (
                      <Link 
                        to="/delivery" 
                        className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
                      >
                        Dashboard
                      </Link>
                    )}
                    
                    {/* Logout */}
                    <button 
                      onClick={logOut}
                      className="p-2 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/signin" 
                      className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/addmember" element={<AddMain />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/delivery" 
              element={
                <ProtectedRoute requiredRole="delivery">
                  <DeliveryDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-orders" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
      </Router>
    );
}

export default App;






// import { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';


// // Components
// import SignUp from './components/SignUp';
// import SignIn from './components/SignIn';
// import ForgotPassword from './components/ForgotPassword';
// import Home from './components/Home';
// import DeliveryDashboard from './components/DeliveryDashboard';
// import AdminDashboard from './components/AdminDashboard';
// import ProtectedRoute from './components/ProtectedRoute';
// import Cart from './components/Cart';
// import MyOrders from './components/MyOrders';

// // Services
// import AuthService from './services/auth.service';

// function App() {
//   const [currentUser, setCurrentUser] = useState(undefined);

//   // Function to update current user state
//   const updateCurrentUser = () => {
//     const user = AuthService.getCurrentUser();
//     if (user && user.user) {
//       setCurrentUser(user);
//     } else {
//       setCurrentUser(undefined);
//     }
//   };

//   useEffect(() => {
//     // Initial check for user
//     updateCurrentUser();
    
//     // Set up event listener for storage changes (for multi-tab support)
//     window.addEventListener('storage', (e) => {
//       if (e.key === 'user') {
//         updateCurrentUser();
//       }
//     });
    
//     // Custom event for auth changes within the same tab
//     window.addEventListener('auth-change', updateCurrentUser);
    
//     return () => {
//       window.removeEventListener('storage', updateCurrentUser);
//       window.removeEventListener('auth-change', updateCurrentUser);
//     };
//   }, []);

//   const logOut = () => {
//     AuthService.logout();
//     setCurrentUser(undefined);
//     window.location.href = '/signin'; // Force a page reload to clear any state
//   };

//   return (
//     <Router>
//       <div className="text-center">
//         <nav className="bg-gray-800 flex justify-between items-center px-8 py-4 text-white">
//           <div className="text-xl font-bold">
//             <Link to="/" className="text-white no-underline">Food Delivery App</Link>
//           </div>
//           <div className="flex gap-4">
//             {currentUser && currentUser.user ? (
//               <>
//                 <span className="text-white">{currentUser.user.name}</span>
//                 {currentUser.user.role === 'customer' && (
//                   <>
//                     <Link to="/cart" className="text-white no-underline">Cart</Link>
//                     <Link to="/my-orders" className="text-white no-underline">My Orders</Link>
//                   </>
//                 )}
//                 <button 
//                   onClick={logOut}
//                   className="bg-transparent border-none text-white cursor-pointer"
//                 >
//                   Log Out
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link to="/signin" className="text-white no-underline">Sign In</Link>
//                 <Link to="/signup" className="text-white no-underline">Sign Up</Link>
//               </>
//             )}
//           </div>
//         </nav>

//         <div className="max-w-7xl mx-auto p-8">
//           <Routes>
//             <Route path="/" element={<Navigate to="/home" />} />
//             <Route path="/signup" element={<SignUp />} />
//             <Route path="/signin" element={<SignIn />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route 
//               path="/home" 
//               element={
//                 <ProtectedRoute requiredRole="customer">
//                   <Home />
//                 </ProtectedRoute>
//               } 
//             />
//             <Route 
//               path="/delivery" 
//               element={
//                 <ProtectedRoute requiredRole="delivery">
//                   <DeliveryDashboard />
//                 </ProtectedRoute>
//               } 
//             />
//             <Route 
//               path="/admin" 
//               element={
//                 <ProtectedRoute requiredRole="admin">
//                   <AdminDashboard />
//                 </ProtectedRoute>
//               } 
//             />
//             <Route 
//               path="/cart" 
//               element={
//                 <ProtectedRoute requiredRole="customer">
//                   <Cart />
//                 </ProtectedRoute>
//               } 
//             />
//             <Route 
//               path="/my-orders" 
//               element={
//                 <ProtectedRoute requiredRole="customer">
//                   <MyOrders />
//                 </ProtectedRoute>
//               } 
//             />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;











