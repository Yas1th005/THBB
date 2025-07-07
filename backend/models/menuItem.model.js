module.exports = (sequelize, Sequelize) => {
  const MenuItem = sequelize.define("menu_item", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    image_url: {
      type: Sequelize.STRING
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    is_available: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return MenuItem;
};