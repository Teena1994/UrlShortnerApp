const mongoose = require("mongoose");

const shortenUrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortenUrl: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  version:{
    type: Number,
    default: 1
  }
});

const shortenUrlList = mongoose.model("shorten_url_list", shortenUrlSchema);

module.exports = shortenUrlList;

