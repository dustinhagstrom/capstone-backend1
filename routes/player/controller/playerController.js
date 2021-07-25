const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Player = require("../model/Player");

const signup = async function (req, res, next) {
  const { firstName, lastName, username, email, password } = req.body;

  // const { errorObj } = res.locals;
  try {
    let salt = await bcrypt.genSalt(12);
    let hashedPassword = await bcrypt.hash(password, salt);

    const createdPlayer = new Player({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    let savedPlayer = await createdPlayer.save();
    res.json({ message: "success - user created", payload: savedPlayer });
  } catch (e) {
    next(e);
  }
};
const login = async function (req, res, next) {
  // const { errorObj } = res.locals;
  const { email, password } = req.body;
  try {
    let foundPlayer = await Player.findOne({ email: email });

    if (!foundPlayer) {
      res.status(400).json({
        message: "failure",
        payload: "Please check your email and password.",
      });
    } else {
      let comparedPassword = await bcrypt.compare(
        password,
        foundPlayer.password
      );

      if (!comparedPassword) {
        res.status(400).json({
          message: "failure",
          payload: "Please check your email and password.",
        });
      } else {
        let jwtToken = jwt.sign(
          {
            email: foundPlayer.email,
            username: foundPlayer.username,
          },
          process.env.PRIVATE_JWT_KEY,
          {
            expiresIn: "1d",
          }
        );

        res.json({
          message: "success",
          payload: jwtToken,
        });
      }
    }
  } catch (e) {
    next(e);
  }
};

const addProfileImage = async function (req, res, next) {
  const imgObj = {
    profileImage: {
      data: fs.readFileSync(
        path.join(__dirname, "../../../uploads/" + req.file.filename)
      ),
      contentType: "image/jpg",
    },
  };
  try {
    let addedPicToPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      imgObj,
      {
        new: true,
      }
    ).select("-__v");
    res.json({ message: "success", payload: addedPicToPlayer });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  signup,
  login,
  addProfileImage,
};
