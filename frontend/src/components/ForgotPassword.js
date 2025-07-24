import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otpSentEmail, setOtpSentEmail] = useState('');
  
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      const response = await AuthService.forgotPassword(email);
      setMessage(response.data.message);
      setOtpSentEmail(response.data.email);
      setStep(2);
    } catch (error) {
      const resMessage = error.response?.data?.message || error.message || "An error occurred";
      setMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match!");
      return;
    }
    
    setMessage('');
    setLoading(true);
    
    try {
      const response = await AuthService.resetPassword(otpSentEmail, otp, newPassword);
      setMessage(response.data.message);
      setStep(3);
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (error) {
      const resMessage = error.response?.data?.message || error.message || "An error occurred";
      setMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 border border-gray-300 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
      
      {step === 1 && (
        <form onSubmit={handleRequestOTP}>
          <div className="mb-4 text-left">
            <label htmlFor="email" className="block mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}
      
      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-4 text-left">
            <p className="mb-4">OTP sent to: {otpSentEmail}</p>
            <label htmlFor="otp" className="block mb-2">Enter OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded text-black"
              placeholder="6-digit OTP"
            />
          </div>
          
          <div className="mb-4 text-left">
            <label htmlFor="newPassword" className="block mb-2">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
          
          <div className="mb-4 text-left">
            <label htmlFor="confirmPassword" className="block mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
      
      {step === 3 && (
        <div className="text-center">
          <p className="text-green-500 mb-4">Password reset successful!</p>
          <p>Redirecting to login page...</p>
        </div>
      )}
      
      {message && <div className={`mt-4 ${step === 3 ? 'text-green-500' : 'text-red-500'}`}>{message}</div>}
    </div>
  );
}

export default ForgotPassword;