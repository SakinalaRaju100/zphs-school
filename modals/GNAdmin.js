const mongoose = require("mongoose");

const gnAdminSchema = new mongoose.Schema(
  {},
  { strict: false, timestamps: true }
);

// EntitySchema.index({ cityId: 1 });

module.exports = mongoose.model("GNAdmin", gnAdminSchema, "GNAdmin");
