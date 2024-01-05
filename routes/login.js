const app = require("express");
const router = app.Router();
const Users = require("../models/users.js");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

router.get("/", async (req, res) => {
  res.render("login", {});
});

router.post("/", [
  body("email")
    .isEmail()
    .isLength({ min: 5, max: 50 })
    .trim()
    .escape()
    .withMessage("Email provided is not Acceptable"),
  body("password")
    .isLength({ min: 5, max: 50 })
    .trim()
    .escape()
    .withMessage("Password is not Acceptable"),
  asyncHandler(async (req, res, next) => {
    const formatErrors = validationResult(req);
    const email = req.body.email;
    //console.log(typeof email);
    const password = req.body.password;
    //console.log(typeof password);
    if (!formatErrors.isEmpty()) {
      res.render("login", {
        email: email,
        password: password,
        formatErrors: formatErrors.mapped(),
      });
      return;
    } else {
      const user = await Users.findOne({ email: email, password: password });
      if (user == null) {
        const validationErr = "Email or Password is Incorrect";
        res.render("login", { validationErr: validationErr });
        return;
      } else {
        res.render("index");
        return;
      }
    }
  }),
]);

module.exports = router;
