const mongoose = require("mongoose");

const feedbacksSchema = new mongoose.Schema({}, { strict: false });

// EntitySchema.index({ cityId: 1 });

module.exports = mongoose.model("Feedbacks", feedbacksSchema, "Feedbacks");
