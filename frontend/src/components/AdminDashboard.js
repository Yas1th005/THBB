import React, { useState, useEffect } from "react";
import AuthService from "../services/auth.service";
import MenuService from "../services/menu.service";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import { Bar, Line, Pie } from "react-chartjs-2";
import OrderDetailsModal from "./OrderDetailsModal";

function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // Initialize missing state variables
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Order details modal state
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Existing state variables
  const [menuItems, setMenuItems] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [success, setSuccess] = useState("");
  const [analyticsData, setAnalyticsData] = useState({
    orderTrends: [],
    revenueTrends: [],
    popularItems: [],
  });
  const [timeRange, setTimeRange] = useState("week");

  // Add logout handler
  const handleLogout = () => {
    AuthService.logout();
    navigate("/signin");
  };

  const addDeliverOrAdmin = () => {
    navigate("/addmember");
  };

  useEffect(() => {
    if (currentUser && currentUser.user && currentUser.user.role === "admin") {
      socket.emit("join-admin-room");

      // Listen for order updates in admin room
      socket.on("admin-order-updated", (data) => {
        if (data.order) {
          updateOrderInState(data.order);
        }
      });

      // Listen for general order updates
      socket.on("order-status-updated", (data) => {
        if (data.order) {
          updateOrderInState(data.order);
        }
      });

      fetchAllOrders();
      fetchMenuItems();
      if (activeTab === "analytics") {
        fetchAnalyticsData();
      }
    }

    return () => {
      socket.off("admin-order-updated");
      socket.off("order-status-updated");
    };
  }, [activeTab, timeRange]);

  const updateOrderInState = (updatedOrder) => {
    setOrders((prevOrders) => {
      // Check if order already exists in state
      const exists = prevOrders.some((order) => order.id === updatedOrder.id);

      // For orders that are pending or out_for_delivery, keep them in the list
      if (
        updatedOrder.status === "pending" ||
        updatedOrder.status === "out_for_delivery"
      ) {
        if (exists) {
          // Update existing order
          return prevOrders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order
          );
        } else {
          // Add new order to the list
          return [...prevOrders, updatedOrder];
        }
      } else {
        // Remove orders that are no longer pending or out_for_delivery
        return prevOrders.filter((order) => order.id !== updatedOrder.id);
      }
    });
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const response = await MenuService.getMenu();
      setMenuItems(response.data);
    } catch (err) {
      setError("Failed to fetch menu items");
      console.error("Error fetching menu items:", err);
    }
  };

  // Handle menu item form submission
  const handleMenuItemSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const menuData = Object.fromEntries(formData.entries());

    // Convert price to number
    menuData.price = parseFloat(menuData.price);
    try {
      if (currentMenuItem) {
        // Update existing item
        await MenuService.updateMenuItem(
          currentMenuItem.id,
          menuData,
          currentUser.token
        );
      } else {
        // Create new item
        await MenuService.createMenuItem(menuData, currentUser.token);
      }

      // Refresh menu items and close modal
      fetchMenuItems();
      setShowMenuModal(false);
      setCurrentMenuItem(null);
    } catch (err) {
      setError("Failed to save menu item");
      console.error("Error saving menu item:", err);
    }
  };

  // Toggle item availability
  const toggleAvailability = async (id, isAvailable) => {
    const isAvailabe_num = isAvailable ? 0 : 1;
    try {
      await MenuService.toggleAvailability(
        id,
        isAvailabe_num,
        currentUser.token
      );

      // Update local state
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, is_available: !isAvailable } : item
        )
      );
    } catch (err) {
      setError("Failed to update item availability");
      console.error("Error updating availability:", err);
    }
  };

  // Open menu item modal for add/edit
  const openMenuModal = (item = null) => {
    setCurrentMenuItem(item);
    setShowMenuModal(true);
  };

  // Fetch all orders - update to filter only pending and out_for_delivery
  const fetchAllOrders = async () => {
    try {
      const response = await axios.get("https://thbb.onrender.com/api/orders/all", {
        headers: {
          "x-access-token": currentUser.token,
        },
      });

      // Filter orders to only show pending and out_for_delivery
      const filteredOrders = response.data.filter(
        (order) =>
          order.status === "pending" || order.status === "out_for_delivery"
      );

      setOrders(filteredOrders);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
      console.error(
        "Error fetching orders:",
        err.response ? err.response.data : err.message
      );
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const response = await axios.get(
        "https://thbb.onrender.com/api/users/delivery",
        {
          headers: {
            "x-access-token": currentUser.token,
          },
        }
      );

      setDeliveryPersons(response.data);
    } catch (err) {
      setError("Failed to fetch delivery personnel");
      console.error("Error fetching delivery personnel:", err);
    }
  };

  const openDeliveryModal = (orderId) => {
    setSelectedOrderId(orderId);
    fetchDeliveryPersons();
    setShowDeliveryModal(true);
  };

  const assignDeliveryPerson = async (orderId, deliveryPersonId) => {
    try {
      // First assign the delivery person
      const assignResponse = await axios.post(
        "https://thbb.onrender.com/api/orders/assign-delivery",
        {
          orderId,
          deliveryGuyId: deliveryPersonId,
        },
        {
          headers: {
            "x-access-token": currentUser.token,
          },
        }
      );

      // Get the updated order from the response
      const updatedOrder = assignResponse.data.order;

      // Find the delivery person details from our list
      const selectedDeliveryPerson = deliveryPersons.find(
        (person) => person.id === deliveryPersonId
      );

      // Add delivery_person object to the updated order
      const enhancedOrder = {
        ...updatedOrder,
        delivery_person: selectedDeliveryPerson,
      };

      // Emit socket event for real-time update
      socket.emit("order-status-update", { order: enhancedOrder });

      // Update local state immediately
      updateOrderInState(enhancedOrder);

      // Close modal
      setShowDeliveryModal(false);
    } catch (err) {
      setError("Failed to assign delivery person");
      console.error("Error assigning delivery person:", err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `https://thbb.onrender.com/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            "x-access-token": currentUser.token,
          },
        }
      );

      // Emit socket event for real-time update
      socket.emit("order-status-update", response.data);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError("Failed to update order status");
      console.error("Error updating order status:", err);
    }
  };

  // Add delete function
  const deleteMenuItem = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone."
      )
    ) {
      try {
        await MenuService.deleteMenuItem(id, currentUser.token);

        // Update local state
        setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
        setSuccess("Menu item deleted successfully");
      } catch (err) {
        setError("Failed to delete menu item");
        console.error("Error deleting menu item:", err);
      }
    }
  };

  // Render menu management tab
  const renderMenuManagement = () => {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Menu Management
            </h3>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
              onClick={() => openMenuModal()}
            >
              <span>Add New Item</span>
            </button>
          </div>

          {menuItems.length === 0 ? (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-400">No menu items found.</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-gray-700 last:border-b-0 p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">
                          {item.name}
                        </h4>
                        <p className="text-gray-400 text-sm">{item.category}</p>
                        <p className="text-orange-500 font-bold text-lg">
                          ₹{item.price}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          item.is_available
                            ? "bg-green-500 bg-opacity-20 text-green-400 border border-green-500"
                            : "bg-red-500 bg-opacity-20 text-red-400 border border-red-500"
                        }`}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-[80px]"
                        onClick={() => openMenuModal(item)}
                      >
                        Edit
                      </button>
                      <button
                        className={`${
                          item.is_available
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-500 hover:bg-green-600"
                        } text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-[80px]`}
                        onClick={() =>
                          toggleAvailability(item.id, item.is_available)
                        }
                      >
                        {item.is_available ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-[80px]"
                        onClick={() => deleteMenuItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {menuItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="py-4 px-6 text-white font-medium">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {item.category}
                        </td>
                        <td className="py-4 px-6 text-orange-500 font-bold">
                          ₹{item.price}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              item.is_available
                                ? "bg-green-500 bg-opacity-20 text-green-400 border border-green-500"
                                : "bg-red-500 bg-opacity-20 text-red-400 border border-red-500"
                            }`}
                          >
                            {item.is_available ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                              onClick={() => openMenuModal(item)}
                            >
                              Edit
                            </button>
                            <button
                              className={`${
                                item.is_available
                                  ? "bg-yellow-500 hover:bg-yellow-600"
                                  : "bg-green-500 hover:bg-green-600"
                              } text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors`}
                              onClick={() =>
                                toggleAvailability(item.id, item.is_available)
                              }
                            >
                              {item.is_available ? "Disable" : "Enable"}
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                              onClick={() => deleteMenuItem(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render orders management tab - update to show delivery person info
  const renderOrdersManagement = () => {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Active Orders
          </h3>

          {orders.length === 0 ? (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-400">No active orders found.</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border-b border-gray-700 last:border-b-0 p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white text-lg">
                            #{order.token}
                          </h4>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === "pending"
                                ? "bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500"
                                : order.status === "out_for_delivery"
                                ? "bg-orange-500 bg-opacity-20 text-orange-400 border border-orange-500"
                                : "bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                          <span className="font-medium">Customer:</span>{" "}
                          {order.user_name || "Unknown"}
                        </p>
                        <p className="text-gray-400 text-sm mb-1">
                          <span className="font-medium">Delivery:</span>{" "}
                          {order.delivery_person ? (
                            <span className="text-green-400">
                              {order.delivery_person.name}
                            </span>
                          ) : (
                            <span className="text-red-400">Not assigned</span>
                          )}
                        </p>
                        <p className="text-orange-500 font-bold text-lg">
                          ₹{order.total_price}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        Orders
                      </button>
                      {order.status === "pending" && (
                        <>
                          <button
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1"
                            onClick={() => openDeliveryModal(order.id)}
                          >
                            Assign Delivery
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1"
                            onClick={() =>
                              updateOrderStatus(order.id, "cancelled")
                            }
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Delivery Person
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="py-4 px-6 text-white font-mono font-medium">
                          #{order.token}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {order.user_name || "Unknown"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === "pending"
                                ? "bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500"
                                : order.status === "out_for_delivery"
                                ? "bg-orange-500 bg-opacity-20 text-orange-400 border border-orange-500"
                                : "bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {order.delivery_person ? (
                            <span className="font-medium text-green-400">
                              {order.delivery_person.name}
                            </span>
                          ) : (
                            <span className="text-red-400">Not assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-orange-500 font-bold">
                          ₹{order.total_price}
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-sm">
                          {new Date(order.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                              onClick={() => handleViewOrderDetails(order)}
                            >
                              Orders
                            </button>
                            {order.status === "pending" && (
                              <>
                                <button
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                  onClick={() => openDeliveryModal(order.id)}
                                >
                                  Assign
                                </button>
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                  onClick={() =>
                                    updateOrderStatus(order.id, "cancelled")
                                  }
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Delivery Person Assignment Modal */}
          {showDeliveryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">
                  Assign Delivery Person
                </h3>

                {deliveryPersons.length === 0 ? (
                  <div className="mb-6">
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-gray-400">
                        No delivery personnel available.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                      Select a delivery person:
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {deliveryPersons.map((person) => (
                        <div
                          key={person.id}
                          className="p-4 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600 hover:border-orange-500 transition-all duration-200"
                          onClick={() =>
                            assignDeliveryPerson(selectedOrderId, person.id)
                          }
                        >
                          <p className="font-medium text-white">
                            {person.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {person.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => setShowDeliveryModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add function to fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(
        `https://thbb.onrender.com/api/analytics/${timeRange}`,
        {
          headers: {
            "x-access-token": currentUser.token,
          },
        }
      );

      setAnalyticsData(response.data);
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error("Error fetching analytics:", err);
    }
  };

  // Handle opening order details modal
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  // Render analytics tab
  const renderAnalytics = () => {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Analytics Dashboard
            </h3>
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === "day"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                onClick={() => setTimeRange("day")}
              >
                Daily
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === "week"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                onClick={() => setTimeRange("week")}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Orders Trend Chart */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-white">
                  Order Trends
                </h4>
                <div className="bg-blue-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <span className="text-blue-400 text-sm font-medium">
                    Orders
                  </span>
                </div>
              </div>
              <div className="h-64 bg-gray-750 rounded-lg p-4">
                <Line
                  data={{
                    labels: analyticsData.orderTrends.map((item) => item.date),
                    datasets: [
                      {
                        label: "Total Orders",
                        data: analyticsData.orderTrends.map(
                          (item) => item.count
                        ),
                        borderColor: "#3B82F6",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#3B82F6",
                        pointBorderColor: "#1E40AF",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#D1D5DB",
                          font: {
                            size: 12,
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: "#9CA3AF",
                        },
                        grid: {
                          color: "rgba(156, 163, 175, 0.1)",
                        },
                      },
                      y: {
                        ticks: {
                          color: "#9CA3AF",
                          beginAtZero: true,
                          precision: 0,
                        },
                        grid: {
                          color: "rgba(156, 163, 175, 0.1)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-white">
                  Revenue Trends
                </h4>
                <div className="bg-green-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <span className="text-green-400 text-sm font-medium">
                    Revenue
                  </span>
                </div>
              </div>
              <div className="h-64 bg-gray-750 rounded-lg p-4">
                <Bar
                  data={{
                    labels: analyticsData.revenueTrends.map(
                      (item) => item.date
                    ),
                    datasets: [
                      {
                        label: "Revenue ($)",
                        data: analyticsData.revenueTrends.map(
                          (item) => item.total
                        ),
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                        borderColor: "#10B981",
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#D1D5DB",
                          font: {
                            size: 12,
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: "#9CA3AF",
                        },
                        grid: {
                          color: "rgba(156, 163, 175, 0.1)",
                        },
                      },
                      y: {
                        ticks: {
                          color: "#9CA3AF",
                          beginAtZero: true,
                          callback: function (value) {
                            return "$" + value;
                          },
                        },
                        grid: {
                          color: "rgba(156, 163, 175, 0.1)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Popular Items Chart */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-white">
                Most Popular Items
              </h4>
              <div className="bg-orange-500 bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-orange-400 text-sm font-medium">
                  Popular
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2">
                <div className="h-80 bg-gray-750 rounded-lg p-4">
                  <Pie
                    data={{
                      labels: analyticsData.popularItems.map(
                        (item) => item.name
                      ),
                      datasets: [
                        {
                          data: analyticsData.popularItems.map(
                            (item) => item.count
                          ),
                          backgroundColor: [
                            "#F97316",
                            "#3B82F6",
                            "#10B981",
                            "#F59E0B",
                            "#EF4444",
                            "#EC4899",
                            "#8B5CF6",
                            "#06B6D4",
                            "#84CC16",
                            "#F43F5E",
                          ],
                          borderColor: "#374151",
                          borderWidth: 2,
                          hoverBorderWidth: 3,
                          hoverBorderColor: "#FFFFFF",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "#374151",
                          titleColor: "#FFFFFF",
                          bodyColor: "#D1D5DB",
                          borderColor: "#6B7280",
                          borderWidth: 1,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="lg:col-span-1">
                <div className="bg-gray-750 rounded-lg p-4 h-80 overflow-y-auto hide-scrollbar">
                  <h5 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                    Items
                  </h5>
                  <div className="space-y-3">
                    {analyticsData.popularItems.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: [
                                "#F97316",
                                "#3B82F6",
                                "#10B981",
                                "#F59E0B",
                                "#EF4444",
                                "#EC4899",
                                "#8B5CF6",
                                "#06B6D4",
                                "#84CC16",
                                "#F43F5E",
                              ][index % 10],
                            }}
                          />
                          <span className="text-sm text-gray-300 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-white">
                            {item.count}
                          </span>
                          <span className="text-xs text-gray-500">orders</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // Main render function
  if (!currentUser || !currentUser.user) {
    return <Navigate to="/signin" />;
  }

  if (loading && activeTab === "orders") {
    return <div className="text-center p-8">Loading orders...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
          <button
            onClick={addDeliverOrAdmin}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Delivery/Admin
          </button>
        </div>
      </div>
      <p className="mb-4">
        Welcome, <span className="font-semibold">{currentUser.user.name}</span>!
      </p>
      <p className="mb-6">
        Your role:{" "}
        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded">
          {currentUser.user.role}
        </span>
      </p>

      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "orders"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "menu"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("menu")}
        >
          Menu
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "analytics"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* Tab content */}
      {activeTab === "orders"
        ? renderOrdersManagement()
        : activeTab === "menu"
        ? renderMenuManagement()
        : renderAnalytics()}

      {/* Menu Item Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center text-black justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {currentMenuItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>

            <form onSubmit={handleMenuItemSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentMenuItem?.name || ""}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={currentMenuItem?.description || ""}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  defaultValue={currentMenuItem?.price || ""}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={currentMenuItem?.category || ""}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  defaultValue={currentMenuItem?.imageUrl || ""}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                  onClick={() => {
                    setShowMenuModal(false);
                    setCurrentMenuItem(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Delivery Person Assignment Modal */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{success}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccess("")}
          >
            <svg
              className="fill-current h-6 w-6 text-green-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        order={selectedOrder}
      />
    </div>
  );
}

export default AdminDashboard;
