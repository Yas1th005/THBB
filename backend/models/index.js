const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    logging: console.log
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Add models
db.users = require('./user.model.js')(sequelize, Sequelize);
db.menuItems = require('./menu.model.js')(sequelize, Sequelize);
db.orders = require("./order.model.js")(sequelize, Sequelize);
db.orderItems = require("./orderItem.model.js")(sequelize, Sequelize);

// Define relationships
db.orders.hasMany(db.orderItems, { foreignKey: 'order_id' });
db.orderItems.belongsTo(db.orders, { foreignKey: 'order_id' });

// Add relationship between orderItems and menuItems
db.orderItems.belongsTo(db.menuItems, { foreignKey: 'menu_item_id' });
db.menuItems.hasMany(db.orderItems, { foreignKey: 'menu_item_id' });

// Add relationship between users and orders
db.users.hasMany(db.orders, { foreignKey: 'user_id', as: 'orders' });
db.orders.belongsTo(db.users, { foreignKey: 'user_id', as: 'user' });

// Add this to your model associations
db.orders.belongsTo(db.users, { 
  foreignKey: 'delivery_guy_id', 
  as: 'delivery_person' 
});

module.exports = db;







