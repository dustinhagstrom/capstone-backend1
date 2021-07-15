const express = require("express");
const logger = require("morgan");
const cors = require("cors");
//can install rateLimit ---- = require("express-rate-limit");

const teamRouter = require("./routes/team/teamRouter");
const playerRouter = require("./routes/player/playerRouter");
const ErrorMessageHandlerClass = require("./routes/utils/ErrorMessageHandlerClass");
const errorController = require("./routes/utils/errorController");

const app = express();

app.use(cors());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/player", playerRouter);
app.use("/api/team", teamRouter);

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
