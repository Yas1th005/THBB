module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.ENUM('customer', 'delivery', 'admin'),
      defaultValue: 'customer'
    }
  }, {
    tableName: 'users', // Explicitly set the table name
    timestamps: true, // Enable timestamps
    createdAt: 'created_at', // Map to the actual column name in the database
    updatedAt: 'updated_at' // Map to the actual column name in the database
  });

  return User;
};



