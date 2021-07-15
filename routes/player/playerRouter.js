const express = require("express");
const router = express.Router();

const {
  getAllPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require("./controller/playerController");

router.get("/get-all-players", getAllPlayers);

router.post("/create-player", createPlayer);

router.put("/update-player/:id", updatePlayer);

router.delete("/delete-player/:id", deletePlayer);

module.exports = router;
