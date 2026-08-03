const User = require("./User");
const Photo = require("./Photo");
const Comment = require("./Comment");
const Like = require("./Like");
const Follow = require("./Follow");
const SavedPhoto = require("./SavedPhoto");
const Notification = require("./Notification");
const Blog = require("./Blog");
const Location = require("./Location");
const SavedLocation = require("./SavedLocation");

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

// Follow relationships
User.hasMany(Follow, { foreignKey: "followerId", onDelete: "CASCADE", as: "following" });
User.hasMany(Follow, { foreignKey: "followingId", onDelete: "CASCADE", as: "followers" });
Follow.belongsTo(User, { foreignKey: "followerId", as: "follower" });
Follow.belongsTo(User, { foreignKey: "followingId", as: "followingUser" });

// SavedPhoto relationships
User.hasMany(SavedPhoto, { foreignKey: "userId", onDelete: "CASCADE" });
SavedPhoto.belongsTo(User, { foreignKey: "userId" });
Photo.hasMany(SavedPhoto, { foreignKey: "photoId", onDelete: "CASCADE" });
SavedPhoto.belongsTo(Photo, { foreignKey: "photoId" });

// Notification relationships
User.hasMany(Notification, { foreignKey: "fromUserId", onDelete: "CASCADE", as: "sentNotifications" });
User.hasMany(Notification, { foreignKey: "toUserId", onDelete: "CASCADE", as: "receivedNotifications" });
Notification.belongsTo(User, { foreignKey: "fromUserId", as: "fromUser" });
Notification.belongsTo(User, { foreignKey: "toUserId", as: "toUser" });
Photo.hasMany(Notification, { foreignKey: "photoId", onDelete: "CASCADE" });
Notification.belongsTo(Photo, { foreignKey: "photoId" });

// Blog relationships
User.hasMany(Blog, { foreignKey: "userId", onDelete: "CASCADE" });
Blog.belongsTo(User, { foreignKey: "userId" });

Photo.hasOne(Blog, { foreignKey: "photoId", onDelete: "CASCADE" });
Blog.belongsTo(Photo, { foreignKey: "photoId" });

// Location and Photo
Location.hasMany(Photo, { foreignKey: "locationId", onDelete: "SET NULL" });
Photo.belongsTo(Location, { foreignKey: "locationId", as: "spot" });

// Saved locations
User.hasMany(SavedLocation, { foreignKey: "userId", onDelete: "CASCADE" });
SavedLocation.belongsTo(User, { foreignKey: "userId" });

Location.hasMany(SavedLocation, { foreignKey: "locationId", onDelete: "CASCADE" });
SavedLocation.belongsTo(Location, { foreignKey: "locationId" });

module.exports = { User, Photo, Comment, Like, Follow, SavedPhoto, Notification, Blog, Location, SavedLocation };