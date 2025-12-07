const mongoose = require("mongoose");

const CallingDataSchema = new mongoose.Schema(
  {},
  { strict: false, timestamps: true }
);

module.exports = mongoose.model(
  "CallingData",
  CallingDataSchema,
  "CallingData"
);
