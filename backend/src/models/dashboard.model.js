import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    quantity: {
      type: Number, // ML
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const dashboardSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    month: {
      type: String, // YYYY-MM
      required: true,
      index: true
    },
    total_quantity: {
      type: Number, // stored as ML
      default: 0
    },
    total_cost: {
      type: Number,
      default: 0
    },
    history: {
      type: [historySchema],
      default: []
    }
  },
  { timestamps: true }
);

// guarantee ONE doc per user per month
dashboardSchema.index({ user_id: 1, month: 1 }, { unique: true });

export default mongoose.model("Dashboard", dashboardSchema);
