const express = require("express");
const checkJwtToken = require("../utils/jwtMiddleware");
const router = express.Router();

const { loadTeamRoster } = require("./controller/teamController");

router.get("/load-team-roster", checkJwtToken, loadTeamRoster);

module.exports = router;
