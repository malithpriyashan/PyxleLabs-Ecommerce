const app = require("express");
const router = app.Router();
const Users = require("../models/users.js");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

router.get("/", async (req, res, next) => {
  res.render("register", {});
});
router.post("/", [
  body("user_name")
    .trim()
    .isLength({ min: 1, max: 25 })
    .escape()
    .isAlphanumeric()
    .withMessage("User name should contain only Letters and Numbers."),
  body("email")
    .isEmail()
    .isLength({ min: 5, max: 40 })
    .trim()
    .escape()
    .normalizeEmail()
    .withMessage("Invalid email address. Please try again."),
  body("password")
    .isLength({ min: 8 })
    .matches("[0-9]")
    .matches("[A-Z]")
    .matches("[a-z]")
    .withMessage(
      "Password Must Contain a Lowercase Letter,Uppercase Letter and a Number"
    )
    .escape()
    .trim(),
  body("confirm_password")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password confirmation does not match password"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const user = new Users({
      user_name: req.body.user_name,
      email: req.body.email,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
    });
    if (!errors.isEmpty()) {
      res.render("register", {
        user: user,
        errors: errors.mapped(),
      });

      return;
    } else {
      await user.save();
      res.redirect("/");
      console.log("validation sucess");
    }
  }),
]);

module.exports = router;
