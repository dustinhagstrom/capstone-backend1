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

module.exports = { loadTeamRoster };
