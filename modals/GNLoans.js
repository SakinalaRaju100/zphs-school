const mongoose = require("mongoose");

const gnLoansSchema = new mongoose.Schema({}, { strict: false });

// EntitySchema.index({ cityId: 1 });

module.exports = mongoose.model("GNLoans", gnLoansSchema, "GNLoans");
