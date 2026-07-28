const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class SavedLocation extends Model {}

// Initialize SavedLocation model
SavedLocation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },


    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },

    
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "savedlocation",
  }
);

module.exports = SavedLocation;