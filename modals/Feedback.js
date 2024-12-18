const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({}, { strict: false });

// EntitySchema.index({ cityId: 1 });

module.exports = mongoose.model("comments", commentsSchema, "comments");
