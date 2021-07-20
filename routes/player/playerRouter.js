const express = require("express");
const router = express.Router();

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
  fetchProfileImage,
} = require("./controller/playerController");

router.post("/signup", signup);

router.post("/login", login);

router.post("/add-profile-image", upload.single("image"), addProfileImage);

router.get("/fetch-profile-image", fetchProfileImage);

module.exports = router;
