const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  totalRequests: {
    type: Number,
    default: 0,
  },
  uniqueUsers: {
    type: [String],
    default: [],
  },
}, {
  versionKey: false,
  timestamps: true,
});

module.exports = mongoose.model("stats", statsSchema);
