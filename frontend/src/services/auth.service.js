import axios from 'axios';

const API_URL = 'https://thbb.onrender.com/api/auth/';

// Helper function to notify about auth changes
const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

// Add axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear user data on unauthorized
      localStorage.removeItem('user');
      notifyAuthChange();
      // Redirect to login page
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

class AuthService {
  async signup(name, email, password, address, role = 'customer') {
    console.log('AuthService signup called with:', { name, email, password, address, role });
    try {
      const response = await axios.post(API_URL + 'signup', {
        name,
        email,
        password,
        address,
        role
      });
      console.log('Signup API response:', response);
      return response;
    } catch (error) {
      console.error('Signup API error:', error);
      throw error;
    }
  }
 
  async signin(email, password) {
    const response = await axios.post(API_URL + 'signin', {
      email,
      password
    });
    
    if (response.data && response.data.token && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data));
      notifyAuthChange(); // Notify about auth change
    }
    
    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
    notifyAuthChange(); // Notify about auth change
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      // Validate that the user object has the expected structure
      if (!user || !user.token || !user.user || !user.user.role) {
        this.logout(); // Clear invalid data
        return null;
      }
      
      return user;
    } catch (error) {
      this.logout(); // Clear invalid data
      return null;
    }
  }

  async forgotPassword(email) {
    return axios.post(API_URL + 'forgot-password', { email });
  }

  async resetPassword(email, otp, newPassword) {
    return axios.post(API_URL + 'reset-password', {
      email,
      otp,
      newPassword
    });
  }
}

export default new AuthService();




