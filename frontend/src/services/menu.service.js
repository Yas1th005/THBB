import axios from "axios";

const API_URL = "http://localhost:5000/api/menu";

class MenuService {
  // Get all menu items
  getMenu() {
    return axios.get(API_URL);
  }

  // Get a single menu item by ID
  getMenuItem(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  // Create a new menu item
  createMenuItem(menuData, token) {
    return axios.post(API_URL, menuData, {
      headers: {
        "x-access-token": token
      }
    });
  }

  // Update an existing menu item
  updateMenuItem(id, menuData, token) {
    return axios.put(`${API_URL}/${id}`, menuData, {
      headers: {
        "x-access-token": token
      }
    });
  }

  // Toggle menu item availability
  toggleAvailability(id, isAvailable, token) {
    return axios.put(`${API_URL}/${id}/availability`, 
      { is_available: isAvailable },
      {
        headers: {
          "x-access-token": token
        }
      }
    );
  }

  // Delete a menu item
  deleteMenuItem(id, token) {
    return axios.delete(`${API_URL}/${id}`, {
      headers: {
        "x-access-token": token
      }
    });
  }
}

export default new MenuService();



