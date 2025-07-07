import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Utensils } from 'lucide-react';
import AuthService from '../services/auth.service';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      const response = await AuthService.signin(email, password);
      setLoading(false);
      
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
      const resMessage = error.response?.data?.message || error.message || "An error occurred";
      setMessage(resMessage);
      setLoading(false);
    }
  };

  return (
    <div className="h-fit bg-gray-900 text-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background gradient overlay */}

      
      <div className="relative w-full max-w-md mt-5">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2">Sign in to your account to continue</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 border border-gray-700">
          <form onSubmit={handleSignIn} className="space-y-6">
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
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
            
            {/* Error Message */}
            {message && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}
            
            {/* Sign In Button */}
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
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Sign up here
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

export default SignIn;














// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import AuthService from '../services/auth.service';

// function SignIn() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const navigate = useNavigate();

//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);
    
//     try {
//       const response = await AuthService.signin(email, password);
//       setLoading(false);
      
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
//       const resMessage = error.response?.data?.message || error.message || "An error occurred";
//       setMessage(resMessage);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-8 border border-gray-300 rounded-lg shadow-sm">
//       <h2 className="text-2xl font-bold mb-6">Sign In</h2>
//       <form onSubmit={handleSignIn}>
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
        
//         <div className="mb-4 text-right">
//           <Link to="/forgot-password" className="text-blue-500 hover:underline">
//             Forgot Password?
//           </Link>
//         </div>
        
//         <button 
//           type="submit" 
//           disabled={loading}
//           className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
//         >
//           {loading ? 'Signing in...' : 'Sign In'}
//         </button>
        
//         {message && <div className="mt-4 text-red-500">{message}</div>}
//       </form>
//     </div>
//   );
// }

// export default SignIn;

