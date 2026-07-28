const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/connection");
class Blog extends Model {}


Blog.init(
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


    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },


    excerpt: {
      type: DataTypes.STRING,
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
    modelName: "blog",
  }
);

module.exports = Blog;