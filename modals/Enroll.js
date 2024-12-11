const mongoose = require("mongoose");

const EnrollSchema = new mongoose.Schema({}, { strict: false });

// EntitySchema.index({ cityId: 1 });

module.exports = mongoose.model("enrolls", EnrollSchema, "enrolls");
