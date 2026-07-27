const User = require("./User");
const Photo = require("./Photo");
const Comment = require("./Comment");
const Like = require("./Like");


User.hasMany(Photo, { foreignKey: "userId", onDelete: "CASCADE" });
Photo.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Comment, { foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "userId" });

Photo.hasMany(Comment, { foreignKey: "photoId", onDelete: "CASCADE" });
Comment.belongsTo(Photo, { foreignKey: "photoId" });

User.hasMany(Like, { foreignKey: "userId", onDelete: "CASCADE" });
Like.belongsTo(User, { foreignKey: "userId" });

Photo.hasMany(Like, { foreignKey: "photoId", onDelete: "CASCADE" });
Like.belongsTo(Photo, { foreignKey: "photoId" });

module.exports = { User, Photo, Comment, Like };

