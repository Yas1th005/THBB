module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("orders", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    delivery_guy_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'delivered', 'cancelled', 'out_for_delivery'),
      defaultValue: 'pending'
    },
    total_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Order;
};


