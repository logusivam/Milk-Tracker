import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    price_per_litre: {
      type: Number,
      required: true
    },
    default_milk_value: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Settings_data", settingsSchema);
