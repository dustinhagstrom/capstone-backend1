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
  password: {
    type: String,
  },
  team: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Team",
    },
  ],
});

module.exports = mongoose.model("Player", PlayerSchema);
