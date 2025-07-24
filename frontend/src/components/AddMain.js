import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, MapPin, UserCheck, Eye, EyeOff, Utensils } from 'lucide-react';
import AuthService from '../services/auth.service';

function AddMain() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      // console.log('Signing up with:', { name, email, password, address, role });
      await AuthService.signup(name, email, password, address, role);
      
      // Auto sign in after successful signup
      const response = await AuthService.signin(email, password);
      
      // Redirect based on user role
      switch(response.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'delivery':
          navigate('/delivery');
          break;
        default:
          navigate('/home');
          break;
      }
    } catch (error) {
      console.error('Signup error:', error);
      const resMessage = error.response?.data?.message || error.message || "An error occurred";
      setMessage(resMessage);
      setLoading(false);
    }
  };

  const getRoleDescription = (roleValue) => {
    switch(roleValue) {
      case 'customer':
        return 'Order food and track deliveries';
      case 'delivery':
        return 'Deliver orders to customers';
      case 'admin':
        return 'Manage the platform and users';
      default:
        return '';
    }
  };

  return (
    <div className="h-fit bg-gray-900 text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[#111827]"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Join Us Today
          </h1>
          <p className="text-gray-400 mt-2">Create your account to get started</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 border border-gray-700">
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                  placeholder="Enter your delivery address"
                />
              </div>
            </div>
            
            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="customer">Customer</option>
                  <option value="delivery">Delivery Partner</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{getRoleDescription(role)}</p>
            </div>
            
            {/* Error Message */}
            {message && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}
            
            {/* Sign Up Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-xs">
          <p>© 2024 Food Delivery App. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AddMain;














// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AuthService from '../services/auth.service';

// function SignUp() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [address, setAddress] = useState('');
//   const [role, setRole] = useState('customer');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const navigate = useNavigate();

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);
    
//     try {
//       console.log('Signing up with:', { name, email, password, address, role });
//       await AuthService.signup(name, email, password, address, role);
      
//       // Auto sign in after successful signup
//       const response = await AuthService.signin(email, password);
      
//       // Redirect based on user role
//       switch(response.user.role) {
//         case 'admin':
//           navigate('/admin');
//           break;
//         case 'delivery':
//           navigate('/delivery');
//           break;
//         default:
//           navigate('/home');
//           break;
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       const resMessage = error.response?.data?.message || error.message || "An error occurred";
//       setMessage(resMessage);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-8 border border-gray-300 rounded-lg shadow-sm">
//       <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
//       <form onSubmit={handleSignUp}>
//         <div className="mb-4 text-left">
//           <label htmlFor="name" className="block mb-2">Name</label>
//           <input
//             type="text"
//             id="name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//             className="w-full p-2 border border-gray-300 rounded"
//           />
//         </div>
        
//         <div className="mb-4 text-left">
//           <label htmlFor="email" className="block mb-2">Email</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="w-full p-2 border border-gray-300 rounded"
//           />
//         </div>
        
//         <div className="mb-4 text-left">
//           <label htmlFor="password" className="block mb-2">Password</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="w-full p-2 border border-gray-300 rounded"
//           />
//         </div>
        
//         <div className="mb-4 text-left">
//           <label htmlFor="address" className="block mb-2">Address</label>
//           <textarea
//             id="address"
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             required
//             className="w-full p-2 border border-gray-300 rounded"
//           />
//         </div>
        
//         <div className="mb-4 text-left">
//           <label htmlFor="role" className="block mb-2">Role</label>
//           <select
//             id="role"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded"
//           >
//             <option value="customer">Customer</option>
//             <option value="delivery">Delivery</option>
//             <option value="admin">Admin</option>
//           </select>
//         </div>
        
//         <button 
//           type="submit" 
//           disabled={loading}
//           className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
//         >
//           {loading ? 'Signing up...' : 'Sign Up'}
//         </button>
        
//         {message && <div className="mt-4 text-red-500">{message}</div>}
//       </form>
//     </div>
//   );
// }

// export default SignUp;


