const Player = require("../../player/model/Player");
const Team = require("../model/Team");

const loadTeamRoster = async function (req, res, next) {
  try {
    const { decodedJwt } = res.locals;

    let payload = await Player.findOne({ email: decodedJwt.email })
      .populate({
        path: "team",
        model: Player,
        select: "-__v",
      })
      .select("-__v -team -_id -username -password");
    res.json({ payload });
  } catch (e) {
    next(e);
  }
};

const createNewTeam = async function (req, res, next) {
  const { teamName } = req.body;

  try {
    const newTeam = new Team({
      teamName,
    });
    const savedNewTeam = await newTeam.save();
    res.json({ newTeam });
  } catch (e) {
    next(e);
  }
};
module.exports = { loadTeamRoster, createNewTeam };
