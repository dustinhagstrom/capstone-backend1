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

router.post("/make-player-and-cc-data", async function (req, res, next) {
  let teamNames = [
    "The Karens",
    // "Ball Sharks",
    // "Nice Kicks",
    // "The Trolls",
    // "The Wizards",
    // "Unicorn Kickers",
    // "The Fireballs",
    // "The Bunters",
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
    let ourJpg = `${fakeFirstName}${fakeLastName}.png`; //rename the faker url to fake username.jpg
    let profileImagePath = path.join(
      __dirname,
      `../../uploads/fakerpics/${ourJpg}`
    ); // this is the location in my files where the pic will go
    console.log(profileImagePath);
    console.log(__dirname);
    axios({
      method: "get",
      url: fakeProfileImage,
      responseType: "stream",
    })
      .then(async function (response) {
        let stream = response.data.pipe(fs.createWriteStream(profileImagePath));
        return stream.path;
      })
      .then(async (response) => {
        fs.access(path.join(__dirname, "../../uploads"), function (err) {
          if (err) {
            res.status(500).send("Directory not found");
          } else {
            fs.access(
              path.join(__dirname, "../../uploads/fakerpics"),
              function (err) {
                if (err) {
                  res.status(500).send("Directory not found");
                } else {
                  fs.readFile(response, async function (err, data) {
                    if (err) {
                      res.status(500).json(err);
                    } else {
                      const createPicData = new Pics({
                        img: {
                          data: data,
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
                      let myRando = Math.floor(Math.random() * 1);
                      let foundTeam = await Team.findOne({
                        teamName: teamNames[myRando],
                      });
                      createPlayerData.team.push(foundTeam._id);
                      createPlayerData.card.push(createCCData._id);
                      createPlayerData.pics.unshift(createPicData._id);
                      foundTeam.teamPlayers.push(createPlayerData._id);
                      createCCData.player.push(createPlayerData._id);
                      await createPlayerData.save();
                      await createCCData.save();
                      await createPicData.save();
                      await foundTeam.save();
                      res.json({
                        payload: [
                          createPlayerData,
                          createCCData,
                          foundTeam,
                          createPicData,
                        ],
                      });
                    }
                  });
                }
              }
            );
          }
        });
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;
