const express = require("express");
const jwtMiddleware = require("../utils/jwtMiddleware");
const router = express.Router();

const {
  loadTeamRoster,
  createNewTeam,
} = require("./controller/teamController");

router.get("/load-team-roster", jwtMiddleware, loadTeamRoster);

router.post("/create-team", createNewTeam);
module.exports = router;
