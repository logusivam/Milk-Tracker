import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD from URL
      required: true,
      index: true
    },
    quantity: {
      type: Number, // ALWAYS stored in ML
      required: true
    },
    cost: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Entry_data", entrySchema);
