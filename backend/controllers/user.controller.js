const db = require('../models');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db.users.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'address', 'role']
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(user);
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send({ message: err.message || "Some error occurred while retrieving the user profile." });
  }
};

// Update user address
exports.updateUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.body;
    
    if (!address || !address.trim()) {
      return res.status(400).send({ message: "Address cannot be empty" });
    }
    
    const user = await db.users.findByPk(userId);
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    
    // Update the user's address
    user.address = address;
    await user.save();
    
    res.status(200).send({ 
      message: "Address updated successfully",
      address: user.address
    });
  } catch (err) {
    console.error("Error updating user address:", err);
    res.status(500).send({ message: err.message || "Some error occurred while updating the address." });
  }
};

// Add this new controller method to fetch delivery personnel
exports.getDeliveryPersonnel = async (req, res) => {
  try {
    // Find all users with role 'delivery'
    const deliveryPersons = await db.users.findAll({
      where: { role: 'delivery' },
      attributes: ['id', 'name', 'email', 'address'] // Only return necessary fields
    });

    if (!deliveryPersons || deliveryPersons.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(deliveryPersons);
  } catch (err) {
    console.error("Error fetching delivery personnel:", err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving delivery personnel."
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users with role 'customer'
    const users = await db.users.findAll({
      where: { role: 'customer' },
      attributes: ['id', 'name', 'email', 'address', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving users."
    });
  }
};


