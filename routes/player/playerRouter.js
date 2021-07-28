const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

const {
  signup,
  login,
  addProfileImage,
  deletePlayer,
} = require("./controller/playerController");

router.post("/signup", signup);

router.post("/login", login);

router.put("/add-profile-image", upload.single("image"), addProfileImage);

router.delete("/delete-player-by-id/:id", deletePlayer);

module.exports = router;
