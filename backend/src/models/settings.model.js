import mongoose from "mongoose";

const durationSchema = new mongoose.Schema(
  {
    start_date: {
      type: String, // yyyy-mm-dd
      required: true
    },
    end_date: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

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
    },
    duration: {
      type: [durationSchema],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("Settings_data", settingsSchema);
