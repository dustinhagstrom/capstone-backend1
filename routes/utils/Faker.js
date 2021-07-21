const faker = require("faker");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const Team = require("../team/model/Team");
const Player = require("../player/model/Player");
const Card = require("../creditcard/model/Card");
const Pics = require("../profilePics/model/Pics");

router.post(
  "/make-player-and-cc-data",
  // upload.single("image"),
  async function (req, res, next) {
    let teamNames = [
      "The Karens",
      "Ball Sharks",
      "Nice Kicks",
      "The Trolls",
      "The Wizards",
      "Unicorn Kickers",
      "The Fireballs",
      "The Bunters",
    ];
    const fakeFirstName = faker.name.firstName();
    const fakeLastName = faker.name.lastName();
    const fakeCardNumber = faker.finance.creditCardNumber();
    const fakeCode = faker.finance.creditCardCVV();
    const fakeExpDate = faker.date.future();
    const fakeUsername = faker.internet.userName();
    const fakeEmail = faker.internet.email();
    const fakePassword = faker.internet.password();
    const fakeProfileImage = faker.image.avatar();

    try {
      let salt = await bcrypt.genSalt(12);
      let hashedPassword = await bcrypt.hash(fakePassword, salt);
      console.log(fakeProfileImage);
      let ourJpg = `${fakeUsername}.jpg`;

      let profileImagePath = path.join(
        process.env.MY_DIRECTORY,
        `uploads/fakerpics/${ourJpg}`
      );
      let getReq = axios({
        method: "get",
        url: fakeProfileImage,
        responseType: "stream",
      }).then(function (response) {
        response.data.pipe(fs.createWriteStream(profileImagePath));
      });

      const createPicData = new Pics({
        img: {
          data: profileImagePath,
          contentType: "image/png",
        },
      });

      const createPlayerData = new Player({
        firstName: fakeFirstName,
        lastName: fakeLastName,
        username: fakeUsername,
        email: fakeEmail,
        password: hashedPassword,
      });

      const createCCData = new Card({
        cardNumber: fakeCardNumber,
        firstName: createPlayerData.firstName,
        lastName: createPlayerData.lastName,
        expDate: fakeExpDate,
        code: fakeCode,
      });

      let myRando = Math.floor(Math.random() * 8);

      let foundTeam = await Team.findOne({ teamName: teamNames[myRando] });

      createPlayerData.team.push(foundTeam._id);
      createPlayerData.card.push(createCCData._id);
      createPlayerData.pics = createPicData._id;
      foundTeam.teamPlayers.push(createPlayerData._id);
      createCCData.player.push(createPlayerData._id);

      await createPlayerData.save();
      await createCCData.save();
      await createPicData.save();
      await foundTeam.save();
      res.json({
        payload: [createPlayerData, createCCData, foundTeam, createPicData],
      });
    } catch (e) {
      console.log(e);
    }
  }
);

module.exports = router;
