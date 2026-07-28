const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class SavedPhoto extends Model {}


SavedPhoto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },


    photoId: {
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
    modelName: "savedphoto",
  }
);

module.exports = SavedPhoto;