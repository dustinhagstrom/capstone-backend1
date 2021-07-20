const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  password: {
    type: String,
  },
  team: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Team",
    },
  ],
  card: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Card",
    },
  ],
});

module.exports = mongoose.model("Player", PlayerSchema);
