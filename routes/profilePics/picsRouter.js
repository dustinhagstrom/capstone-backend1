const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const Pics = require("./model/Pics");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/fakerpics");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

router.post(
  "/add-image-to-db",
  upload.single("image"),
  async (req, res, next) => {
    const picPath = path.join(
      process.env.MY_DIRECTORY,
      "uploads/fakerpics/1.jpg"
    );

    try {
      const newPic = await new Pics({
        img: {
          data: fs.readFileSync(picPath),
          contentType: "image/png",
        },
      });
      newPic.save();
      res.json({ message: "success", payload: newPic });
    } catch (e) {
      next(e);
    }
  }
);
module.exports = router;
