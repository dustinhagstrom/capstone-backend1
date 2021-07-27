const faker = require("faker");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/fakerpics");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
const Team = require("../team/model/Team");
const Player = require("../player/model/Player");
const Card = require("../creditcard/model/Card");
const Pics = require("../profilePics/model/Pics");
const myPhotoMiddleware = async function (req, res, next) {
  try {
    const fakeFirstName = faker.name.firstName();
    const fakeLastName = faker.name.lastName();
    const fakeProfileImage = faker.image.avatar();
    res.locals.fakeFirstName = fakeFirstName;
    res.locals.fakeLastName = fakeLastName;
    let ourJpg = `${fakeFirstName}${fakeLastName}.png`;
    let profileImagePath = path.join(
      __dirname,
      `../../uploads/fakerpics/${ourJpg}`
    );
    await axios({
      method: "get",
      url: fakeProfileImage,
      responseType: "stream",
    }).then(function (response) {
      response.data.pipe(fs.createWriteStream(profileImagePath));
      next();
    });
  } catch (e) {
    next(e);
  }
};
router.post(
  "/make-player-and-cc-data",
  // myPhotoMiddleware,
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
    // const { fakeFirstName, fakeLastName } = res.locals;
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
          let stream = response.data.pipe(
            fs.createWriteStream(profileImagePath)
          );
          return stream.path;
        })
        .then(async (response) => {
          fs.access(
            "/Users/dustinhagstrom/Documents/code-immersives/term-2/fullstack-project-1/capstone-backend/uploads",
            function (err) {
              if (err) {
                res.status(500).send("Directory not found");
              } else {
                fs.access(
                  "/Users/dustinhagstrom/Documents/code-immersives/term-2/fullstack-project-1/capstone-backend/uploads/fakerpics",
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
                            // matchPictureToPlayer: ourJpg,
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
                          let foundTeam = await Team.findOne({
                            teamName: teamNames[myRando],
                          });
                          createPlayerData.team.push(foundTeam._id);
                          createPlayerData.card.push(createCCData._id);
                          createPlayerData.pics.shift(createPicData._id);
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
            }
          );
        })
        .catch((e) => {
          console.log(e);
        });
      //this sends req to api for the pic and takes the response and stores it in file location previously defined as a buffer.
      //this makes new pics data by going to file location and getting the data that is stored there. the data is already a buffer.
    } catch (e) {
      console.log(e);
    }
  }
);
//the following code i used with postman to
router.post(
  "/store-pic",
  upload.single("image"),
  async function (req, res, next) {
    try {
      const createPicData = new Pics({
        img: {
          data: fs.readFileSync(
            `${__dirname}../../uploads/fakerpics/${req.file.originalname}`
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
// router.post("/store-pics", upload.array("images", array.length));
module.exports = router;
