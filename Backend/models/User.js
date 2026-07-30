const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class User extends Model {}



User.init(
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

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },


    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },


    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  

    role: {
      type: DataTypes.ENUM("visitor", "member", "admin"),
      allowNull: false,
      defaultValue: "member",
    },

    profilePhoto: {
      type: DataTypes.STRING,
    },

    title: {
      type: DataTypes.STRING,
    },

    location: {
      type: DataTypes.STRING,
    },

    bio: {
      type: DataTypes.TEXT,
    },
  },

  
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "user",
  }
);

module.exports = User;