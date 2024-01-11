const express = require("express");
const router = express.Router();
const User = require("../models/users");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

router.post("/", [
  body("email")
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 5, max: 50 })
    .escape()
    .trim()
    .withMessage("Invalid email address."),
  body("password")
    .isLength({ min: 8, max: 50 })
    .matches("[0-9]")
    .matches("[A-Z]")
    .matches("[a-z]")
    .escape()
    .trim()
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage(
      "Password must contain a lowercase letter, uppercase letter, and a number"
    ),
  body("confirm_password")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password confirmation does not match password"),
  body("gender").isLength({ min: 1 }).withMessage("This field cannot be Empty"),
  body("phone")
    .isLength({ min: 8, max: 50 })
    .isNumeric()
    .trim()
    .escape()
    .withMessage("Phone number is incorrect"),
  body("address")
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage("Address is not valid"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const user = new User({
      local: {
        email: req.body.email,
        password: req.body.password,
        gender: req.body.gender,
        phone: req.body.phone,
        address: req.body.address,
      },
      google: {
        email: req.body.email,
      },
    });

    if (!errors.isEmpty) {
      return res.render("/profile", { user: user, errors: errors.mapped() });
    } else {
      await User.findOneAndUpdate({ email: req.body.email }, user);
      res.redirect("/");
    }
  }),
]);

module.exports = router;
