const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
    },
    usnername: {
      type: String,
      unique: true,
    },
    IsPro: {
      type: Boolean,
    },
    requests: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
