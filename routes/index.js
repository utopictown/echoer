var express = require("express");
var router = express.Router();
var FB = require("fb");
var axios = require("axios");
const boot = require("../services/boot");
const Setting = require("../models/setting");

/* GET home page. */
router.get("/", async function (req, res, next) {
  if (req.FBPageToken != null) {
    const bootCond = { key: "booted", value: 1 };
    const isBooted = await Setting.findOne(bootCond);
    if (!isBooted) {
      await Setting.findOneAndUpdate(bootCond);
      boot(req);
    }
  }
  res.render("index", { title: "Express" });
});

module.exports = router;
