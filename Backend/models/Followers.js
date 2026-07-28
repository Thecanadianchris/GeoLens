const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/connection");
class Follow extends Model {}




Follow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },


    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    followingId: {
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
    modelName: "follow",
  }
);

module.exports = Follow;