const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Player", playerSchema);
