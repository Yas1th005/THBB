module.exports = (sequelize, Sequelize) => {
  const OrderItem = sequelize.define("order_items", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    menu_item_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    price_at_time: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // No updated_at column in the table
  });

  return OrderItem;
};

