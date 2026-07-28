const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class Notification extends Model {}


Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },


    type: {
      type: DataTypes.ENUM("like", "comment", "follow"),
      allowNull: false,
    },


    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    photoId: {
      type: DataTypes.INTEGER,
    },


    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: "notification",
  }
);

module.exports = Notification;