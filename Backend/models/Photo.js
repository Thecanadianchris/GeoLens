const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class Photo extends Model {}

Photo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    location: {
      type: DataTypes.STRING,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cameraDetails: {
      type: DataTypes.STRING,
    },

    weatherCondition: {
      type: DataTypes.STRING,
    },

    weatherRating: {
      type: DataTypes.INTEGER,
    },

    latitude: {
      type: DataTypes.FLOAT,
    },

    longitude: {
      type: DataTypes.FLOAT,
    },

    dateTaken: {
      type: DataTypes.DATEONLY,
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    locationId: {
      type: DataTypes.INTEGER,
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
    modelName: "photo",
  }
);

module.exports = Photo;