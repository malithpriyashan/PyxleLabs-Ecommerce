require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const profileRouter = require("./routes/profile");

const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const mongostore = require("connect-mongo");

main().catch((err) => {
  console.log(err);
});
require("./config/passport")(passport);

async function main() {
  const db_url = process.env.DB_URL;
  mongoose.connection.on("connected", () => console.log("connected"));
  mongoose.connection.on("open", () => console.log("open"));
  mongoose.connection.on("disconnected", () => console.log("disconnected"));
  mongoose.connection.on("reconnected", () => console.log("reconnected"));
  mongoose.connection.on("disconnecting", () => console.log("disconnecting"));
  mongoose.connection.on("close", () => console.log("close"));
  await mongoose
    .connect(db_url)
    .then(() => {
      console.log("connected succesfully");
    })
    .catch((err) => console.log(err));
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: mongostore.create({
      mongoUrl: process.env.DB_URL,
      collectionName: "sessions",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

require("./routes/authenticate")(app, passport);
app.use("/", indexRouter);
app.use("/profile", profileRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
