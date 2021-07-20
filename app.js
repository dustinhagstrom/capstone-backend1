const express = require("express");
const logger = require("morgan");
const cors = require("cors");

//can install rateLimit ---- = require("express-rate-limit");

const teamRouter = require("./routes/team/teamRouter");
const playerRouter = require("./routes/player/playerRouter");
const creditRouter = require("./routes/creditcard/creditRouter");
const ErrorMessageHandlerClass = require("./routes/utils/ErrorMessageHandlerClass");
const errorController = require("./routes/utils/errorController");
const fakerController = require("./routes/utils/Faker");

const app = express();

app.use(cors());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/faker", fakerController);
app.use("/api/player", playerRouter);
app.use("/api/team", teamRouter);
app.use("/api/cc", creditRouter);

// catch 404 and forward to error handler
app.all("*", function (req, res, next) {
  next(
    new ErrorMessageHandlerClass(
      `Cannot find ${req.originalUrl} on this server! Check your URL`,
      404
    )
  );
});

app.use(errorController);
module.exports = app;
