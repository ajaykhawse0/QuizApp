const passport = require("passport");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../models/User");
dotenv.config();

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async function (accessToken, refreshToken, profile, cb) {
      try {
        // Ensure Google provided email
        if (!profile.emails || !profile.emails.length) {
          return cb(new Error("Google account has no email!"));
        }

        const email = profile.emails[0].value;

        // Check existing user
        let user = await User.findOne({ email });

        if (!user) {
          // Generate random password for schema requirement
          const randomPassword = Math.random().toString(36).slice(-8);

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(randomPassword, salt);
             console.log(profile);
             
          user = new User({
            name: profile.displayName,
            email,
            password: hashedPassword,
            passwordLength: randomPassword.length,
            profilePicture: profile._json?.picture || "",
          });

          await user.save();
        }

        return cb(null, user);
      } catch (err) {
        console.error("Google Auth Error:", err);
        return cb(err, null);
      }
    }
  )
);

// serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
module.exports = passport;