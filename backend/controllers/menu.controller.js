const db = require('../models');
const MenuItem = db.menuItems;

// Get all menu items
exports.getAllItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll();
    
    res.status(200).json(menuItems);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ 
      message: err.message || "Some error occurred while retrieving menu items." 
    });
  }
};

// Get a single menu item by ID
exports.getItemById = async (req, res) => {
  try {
    const id = req.params.id;
    
    const menuItem = await MenuItem.findByPk(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    res.status(200).json(menuItem);
  } catch (err) {
    console.error('Error fetching menu item:', err);
    res.status(500).json({ 
      message: err.message || "Some error occurred while retrieving the menu item." 
    });
  }
};

// Create sample menu items (for development)
exports.createSampleItems = async (req, res) => {
  try {
    const sampleItems = [
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 12.99,
        image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        category: "Pizza"
      },
      {
        name: "Chicken Burger",
        description: "Grilled chicken breast with lettuce, tomato, and special sauce",
        price: 9.99,
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        category: "Burgers"
      },
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
        price: 8.99,
        image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
        category: "Salads"
      }
    ];
    
    await MenuItem.bulkCreate(sampleItems);
    
    res.status(201).json({ message: "Sample menu items created successfully" });
  } catch (err) {
    console.error('Error creating sample menu items:', err);
    res.status(500).json({ 
      message: err.message || "Some error occurred while creating sample menu items." 
    });
  }
};

// Create a new menu item
exports.createItem = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Name, description, price, and category are required" });
    }
    
    const newItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      image_url:imageUrl,
      is_available: true
    });
    
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating menu item:', err);
    res.status(500).json({ 
      message: err.message || "Some error occurred while creating the menu item." 
    });
  }
};

// Update a menu item
exports.updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, category, imageUrl } = req.body;
    
    // Find the menu item
    const menuItem = await MenuItem.findByPk(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    // Update the menu item
    await menuItem.update({
      name,
      description,
      price,
      category,
      image_url:imageUrl
    });
    
    res.status(200).json(menuItem);
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ 
      message: err.message || "Some error occurred while updating the menu item." 
    });
  }
};

// Toggle menu item availability
exports.toggleAvailability = async (req, res) => {
  try {
    const id = req.params.id;
    const { is_available } = req.body;
    
    // Find the menu item
    const menuItem = await MenuItem.findByPk(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    // Update availability
    await menuItem.update({ is_available });
    
    res.status(200).json(menuItem);
  } catch (err) {
    console.error('Error toggling menu item availability:', err);
    res.status(500).json({ 
      message: err.message || "Some error occurred while updating the menu item." 
    });
  }
};

// Delete a menu item
exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find the menu item
    const menuItem = await MenuItem.findByPk(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    // Delete the menu item
    await menuItem.destroy();
    
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ 
      message: err.message || "Some error occurred while deleting the menu item." 
    });
  }
};

