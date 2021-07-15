const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
  },
  players: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Player",
    },
  ],
});

module.exports = mongoose.model("Team", TeamSchema);
