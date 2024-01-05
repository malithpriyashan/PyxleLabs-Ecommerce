const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/users");
require("dotenv").config();

module.exports = async function (passport) {
  //Persists user data inside session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  //Fetches session details using session id
  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  //removing processstick and part of local
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },

      async (req, email, password, done) => {
        try {
          const newUser = new User();
          newUser.local.email = email;
          newUser.local.password = await newUser.generateHash(password);
          console.log(req.body.phone);
          newUser.local.phone = req.body.phone;
          newUser.local.address = req.body.address;
          await newUser.save();
          return done(null, newUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const user = await User.findOne({ "local.email": email });
          if (!user) {
            return done(null, false);
          }

          if (!user.validPassword(password)) {
            return done(null, false);
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          const user = await User.findOne({ "google.id": profile.id });

          if (user) {
            // User found, log them in
            return done(null, user);
          } else {
            // Create a new user
            const newUser = new User({
              google: {
                id: profile.id,
                //token: accesstoken, // Assuming you want to store accessToken here
                name: profile.displayName,
                email: profile.emails[0].value,
              },
            });

            await newUser.save();
            return done(null, newUser);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
