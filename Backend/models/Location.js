const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class Location extends Model {}

// Initialize Location model
Location.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },


    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },


    county: {
      type: DataTypes.STRING,
      allowNull: false,
    },


    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },


    description: {
      type: DataTypes.TEXT,
    },


    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },


    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },


    photographyScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },


    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
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
    modelName: "location",
  }
);

module.exports = Location;