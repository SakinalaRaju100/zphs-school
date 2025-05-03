const mongoose = require("mongoose");

const gnUsersSchema = new mongoose.Schema({}, { strict: false });

// EntitySchema.index({ cityId: 1 });

module.exports = mongoose.model("GNUsers", gnUsersSchema, "GNUsers");
