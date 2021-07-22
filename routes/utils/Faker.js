const faker = require("faker");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const Team = require("../team/model/Team");
const Player = require("../player/model/Player");
const Card = require("../creditcard/model/Card");
const Pics = require("../profilePics/model/Pics");

router.post("/make-player-and-cc-data", async function (req, res, next) {
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
    let ourJpg = `${fakeFirstName}${fakeLastName}.png`; //rename the faker url to fake username.jpg

    let profileImagePath = path.join(
      process.env.MY_DIRECTORY,
      `uploads/fakerpics/${ourJpg}`
    ); // this is the location in my files where the pic will go
    axios({
      method: "get",
      url: fakeProfileImage,
      responseType: "stream",
    }).then(function (response) {
      response.data.pipe(fs.createWriteStream(profileImagePath));
    }); //this sends req to api for the pic and takes the response and stores it in file location previously defined as a buffer.

    const createPicData = new Pics({
      img: {
        data: profileImagePath, //fs.readFileSync(req.file.path),
        contentType: "image/png",
      },
    }); //this makes new pics data by going to file location and getting the data that is stored there. the data is already a buffer.

    const createPlayerData = new Player({
      firstName: fakeFirstName,
      lastName: fakeLastName,
      username: fakeUsername,
      email: fakeEmail,
      matchPictureToPlayer: ourJpg,
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
      payload: [createPlayerData, createCCData, foundTeam],
    });
  } catch (e) {
    console.log(e);
  }
});

//how can i loop through all the people and if they don't
router.post(
  "/store-pic",
  upload.single("image"),
  async function (req, res, next) {
    try {
      const createPicData = new Pics({
        img: {
          data: fs.readFileSync(
            `${process.env.MY_DIRECTORY}/uploads/fakerpics/${req.body.path}`
          ),
          contentType: "image/png",
        },
      });
      await createPicData.save();
      res.json({ message: "success" });
    } catch (e) {
      console.log(e);
    }
  }
);

module.exports = router;
