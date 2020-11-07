var mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  message_id: String,
  message: String,
  from: Object,
  created_time: String,
  attachments: Object,
  is_sent: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Message", messageSchema);
