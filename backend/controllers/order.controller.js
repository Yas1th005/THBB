const db = require('../models');
const Order = db.orders;
const OrderItem = db.orderItems;
const User = db.users;
const MenuItem = db.menuItems;
const crypto = require('crypto');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { user_id, items, address, total_price } = req.body;
    
    // Validate request
    if (!items || items.length === 0) {
      return res.status(400).send({ message: "Order must contain at least one item" });
    }
    
    // Generate unique order token
    const token = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    // Create order in database
    const order = await Order.create({
      user_id,
      delivery_guy_id: null, // Initially null, will be assigned later
      token,
      status: 'pending',
      total_price,
      address,
    });
    
    // Create order items with the correct column names
    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price
    }));
    
    await OrderItem.bulkCreate(orderItems);
    
    res.status(201).send({
      message: "Order placed successfully",
      token: order.token
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).send({ message: err.message || "Some error occurred while creating the order." });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    // Fix: Get userId from req.user.id instead of req.userId
    const userId = req.user.id;
    // console.log('Fetching orders for user ID:', userId);
    
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'delivery_person',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: OrderItem,
          include: [
            {
              model: MenuItem
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Format the response to include delivery person info
    const formattedOrders = orders.map(order => {
      const plainOrder = order.get({ plain: true });
      return {
        ...plainOrder,
        delivery_person: plainOrder.delivery_person || null
      };
    });
    
    res.status(200).send(formattedOrders);
  } catch (err) {
    console.error("Error retrieving user orders:", err);
    res.status(500).send({ message: err.message });
  }
};

// Get order by token
exports.getOrderByToken = async (req, res) => {
  try {
    const token = req.params.token;
    
    const order = await Order.findOne({
      where: { token: token },
      include: [{
        model: OrderItem,
        include: [{
          model: db.menuItems,
          attributes: ['id', 'name', 'description', 'price', 'image_url']
        }]
      }]
    });
    
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }
    
    // Format the response
    const formattedOrder = {
      id: order.id,
      token: order.token,
      status: order.status,
      total_price: order.total_price,
      address: order.address,
      created_at: order.created_at,
      items: order.order_items.map(item => ({
        id: item.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price_at_time: item.price_at_time,
        menu_item: item.menu_item
      }))
    };
    
    res.send(formattedOrder);
  } catch (err) {
    console.error("Error retrieving order:", err);
    res.status(500).send({ message: err.message || "Some error occurred while retrieving the order." });
  }
};

// Assign delivery guy to an order
exports.assignDeliveryGuy = async (req, res) => {
  try {
    const { orderId, deliveryGuyId } = req.body;
    
    // Find the order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }
    
    // Update the order with the delivery guy ID and change status
    order.delivery_guy_id = deliveryGuyId;
    order.status = 'out_for_delivery';
    
    await order.save();
    
    // Get the updated order with all necessary information including delivery person
    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email'] 
        },
        {
          model: User,
          as: 'delivery_person',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    // Format the response to include user_name and delivery_person
    const formattedOrder = {
      ...updatedOrder.get({ plain: true }),
      user_name: updatedOrder.user ? updatedOrder.user.name : null
    };
    
    res.send({
      message: "Delivery guy assigned successfully",
      order: formattedOrder
    });
  } catch (err) {
    console.error("Error assigning delivery guy:", err);
    res.status(500).send({ message: err.message || "Some error occurred while assigning the delivery guy." });
  }
};

// Get orders assigned to a delivery person
exports.getAssignedOrders = async (req, res) => {
  try {
    const deliveryGuyId = req.params.deliveryGuyId;
    
    const orders = await Order.findAll({
      where: { 
        delivery_guy_id: deliveryGuyId,
        status: ['pending', 'out_for_delivery'] // Only get active orders
      },
      include: [{ model: OrderItem }],
      order: [['created_at', 'DESC']]
    });
    
    res.send(orders);
  } catch (err) {
    console.error("Error retrieving assigned orders:", err);
    res.status(500).send({ message: err.message || "Some error occurred while retrieving assigned orders." });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    console.log(`Updating order ${orderId} to status: ${status}`);
    
    // Validate status
    const validStatuses = ['pending', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({ message: "Invalid status value" });
    }
    
    // Find the order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }
    
    console.log("Current order status:", order.status);
    
    // Update the order status
    order.status = status;
    await order.save();
    
    console.log("Order status updated to:", status);
    
    // Get the updated order with all necessary information
    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email'] 
        },
        {
          model: User,
          as: 'delivery_person',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: OrderItem,
          include: [{ model: MenuItem }]
        }
      ]
    });
    
    // Socket.IO is handled in the route, we just return the updated order
    res.send({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).send({ 
      message: err.message || "Some error occurred while updating the order status." 
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    // Join with users table to get customer names and delivery person info
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'delivery_person',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: OrderItem,
          include: [
            {
              model: MenuItem
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Format the response
    const formattedOrders = orders.map(order => {
      const plainOrder = order.get({ plain: true });
      return {
        ...plainOrder,
        user_name: plainOrder.user ? plainOrder.user.name : null,
        delivery_person: plainOrder.delivery_person || null
      };
    });
    
    res.status(200).send(formattedOrders);
  } catch (err) {
    console.error("Error retrieving all orders:", err);
    res.status(500).send({ message: err.message });
  }
};












