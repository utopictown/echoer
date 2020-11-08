var express = require("express");
var router = express.Router();
var passport = require("passport");
var Strategy = require("passport-facebook").Strategy;
var axios = require("axios");
var Setting = require("../models/setting");
require("dotenv").config();

passport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.APP_URL + "/auth/facebook/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });

      longLivedToken = await getLongLivedToken(accessToken);
      return cb(null, longLivedToken);
    }
  )
);

async function getLongLivedToken(token) {
  try {
    const result = await axios.get(
      process.env.GRAPH_ENDPOINT + "oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          fb_exchange_token: token,
        },
      }
    );
    return result.data.access_token;
  } catch (error) {
    console.error(error);
  }
}

/* GET users listing. */
router.get(
  "/login/facebook",
  passport.authenticate("facebook", {
    scope: ["pages_manage_posts", "pages_messaging", "pages_show_list"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    Setting.findOneAndUpdate({ key: "booted", value: 0 })
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.error(err);
      });
  }
);

module.exports = router;
