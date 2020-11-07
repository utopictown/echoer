var mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema({
  key: String,
  value: Schema.Types.Mixed,
});

module.exports = mongoose.model("Setting", settingSchema);
