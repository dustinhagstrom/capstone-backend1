const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const Pics = require("./model/Pics");
const jwtMiddleware = require("../utils/jwtMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/uploadedPics/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

router.post(
  "/add-image-to-db",
  jwtMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    const { decodedJwt } = res.locals;

    const picPath = path.join(
      process.env.MY_DIRECTORY,
      //   `${decodedJwt.username}.jpg`
      "/uploads/uploadedPics/" + req.file.filename
    );

    try {
      const newPic = new Pics({
        img: {
          data: fs.readFileSync(picPath),
          contentType: "image/png",
        },
      });
      await newPic.save();
      res.json({ message: "success", payload: newPic });
    } catch (e) {
      next(e);
    }
  }
);
module.exports = router;
