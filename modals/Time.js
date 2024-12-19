const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({}, { strict: false });

// EntitySchema.index({ cityId: 1 });

module.exports = mongoose.model("Time", timeSchema, "Time");
