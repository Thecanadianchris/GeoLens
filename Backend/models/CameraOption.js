const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class CameraOption extends Model {}

CameraOption.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("lens", "settings"),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "camera_option",
    indexes: [{ unique: true, fields: ["type", "value"] }],
  }
);

module.exports = CameraOption;