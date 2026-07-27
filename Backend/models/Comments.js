const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class Comment extends Model {}


Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },


    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    modelName: "comment",
  }
);

module.exports = Comment;