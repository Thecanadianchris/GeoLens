const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class Like extends Model {}


Like.init(
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
    modelName: "like",
  }
);

module.exports = Like;