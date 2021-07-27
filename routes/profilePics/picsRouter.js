const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const Pics = require("./model/Pics");
const Player = require("../player/model/Player");

const jwtMiddleware = require("../utils/jwtMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/uploadedPics");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
}); //from multer documentation
const upload = multer({ storage: storage }); //from multer documentation

router.post(
  "/upload-player-image-to-db",
  jwtMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    const { decodedJwt } = res.locals;
    const picPath = path.join(
      __dirname,
      `../../uploads/uploadedPics/${req.file.originalname}`
    ); //defining where the uploaded pic is for later use in reading data from location.

    try {
      const newPic = new Pics({
        img: {
          data: fs.readFileSync(picPath),
          contentType: "image/png",
        },
      }); //make a new pics by reading data from stored location

      let foundPlayer = await Player.findOne({ email: decodedJwt.email });
      if (foundPlayer.pics.length > 1) {
        foundPlayer.pics.shift();
      }

      await Pics.findByIdAndRemove({ _id: foundPlayer.pics[0] }); //delete the old user photo from db.
      foundPlayer.pics.unshift(newPic._id); //push new id to player data
      await foundPlayer.save(); //save new player info
      await newPic.save(); //save new pic info
      res.json({ message: "success" });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/player-image", jwtMiddleware, async (req, res, next) => {
  const { decodedJwt } = res.locals;

  try {
    let imageToSend = await Player.findOne({ email: decodedJwt.email });

    let foundUserImage = await Pics.findById({ _id: imageToSend.pics[0] });

    res.json({ message: "success", payload: foundUserImage });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
