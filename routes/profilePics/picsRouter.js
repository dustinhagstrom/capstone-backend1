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
    cb(null, "uploads/uploadedPics/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
}); //from multer documentation
const upload = multer({ storage: storage }); //from multer documentation

router.post(
  "/upload-player-image-to-db",
  jwtMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    const { decodedJwt } = res.locals;
    console.log("here");
    const picPath = path.join(
      process.env.MY_DIRECTORY,
      `/uploads/uploadedPics/${req.file.filename}`
    ); //defining where the uploaded pic is for later use in reading data from location.

    try {
      const newPic = new Pics({
        img: {
          data: fs.readFileSync(picPath),
          contentType: "image/png",
        },
      }); //make a new pics by reading data from stored location

      let foundPlayer = await Player.findOne({ email: decodedJwt.email });
      foundPlayer.pics = newPic._id;

      await newPic.save();
      res.json({ message: "success", payload: newPic });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/player-image", jwtMiddleware, async (req, res, next) => {
  const { decodedJwt } = res.locals;

  try {
    let foundPlayer = await Player.findOne({ email: decodedJwt.email })
      .populate({
        path: "pics",
        model: Pics,
        select: "-__v",
      })
      .select("-email -password -firstName -lastName -__v -_id -username");
  } catch (e) {
    next(e);
  }
});
module.exports = router;
