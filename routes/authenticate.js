const User = require("../models/users");
const { body, check, validationResult } = require("express-validator");
module.exports = function (app, passport) {
  app.get("/login", function (req, res) {
    res.render("login", {});
  });

  app.post(
    "/login",
    [
      check("email")
        .isEmail()
        .normalizeEmail()
        .isLength({ min: 5, max: 50 })
        .escape()
        .trim()
        .withMessage("Invalid email address.")
        .custom(async (value) => {
          const existingUser = await User.find({ local: { email: value } });
          if (!existingUser) {
            throw new Error("Their is no user with this Email Address");
          }
        }),
      check("password")
        .isLength({ min: 8, max: 50 })
        .matches("[0-9]")
        .matches("[A-Z]")
        .matches("[a-z]")
        .escape()
        .trim()
        // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .withMessage("Password is Invalid"),
    ],
    async (req, res, next) => {
      const errors = validationResult(req);
      console.log(errors);
      const user = new User({
        local: {
          email: req.body.email,
          password: req.body.password,
        },
      });
      if (!errors.isEmpty()) {
        return res.render("login", { user: user, errors: errors.mapped() }); // Render errors from req.errors
      }
      next();
    },
    passport.authenticate("local-login", {
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/login", // redirect back to the signup page if there is an error
    })
  );

  app.get("/register", function (req, res) {
    res.render("register", {});
  });

  app.post(
    "/register",
    [
      check("email")
        .isEmail()
        .normalizeEmail()
        .isLength({ min: 5, max: 50 })
        .escape()
        .trim()
        .withMessage("Invalid email address.")
        .custom(async (value) => {
          const existingUser = await User.find({ local: { email: value } });
          if (existingUser) {
            throw new Error("E-mail already in use");
          }
        }),
      check("password")
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
      check("confirm_password")
        .custom((value, { req }) => {
          return value === req.body.password;
        })
        .withMessage("Password confirmation does not match password"),
      check("phone")
        .isLength({ min: 8, max: 50 })
        .isNumeric()
        .trim()
        .escape()
        .withMessage("Phone number is incorrect"),
      check("address")
        .isLength({ min: 1, max: 50 })
        .trim()
        .escape()
        .withMessage("Address is not valid"),
    ],
    async (req, res, next) => {
      const errors = validationResult(req);
      console.log(errors);
      const user = new User({
        local: {
          email: req.body.email,
          password: req.body.password,
          phone: req.body.phone,
          address: req.body.address,
        },
      });
      if (!errors.isEmpty()) {
        return res.render("register", { user: user, errors: errors.mapped() }); // Render errors from req.errors
      }
      next();
    },
    passport.authenticate("local-signup", {
      successRedirect: "/profile",
      failureRedirect: "/register",
    })
  );

  app.get("/profile", isLoggedIn, function (req, res) {
    res.render("profile", {
      user: req.user,
    });
  });

  app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // the callback after google has authenticated the user
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/profile",
      failureRedirect: "/",
    })
  );
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}
