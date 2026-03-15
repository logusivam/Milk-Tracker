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

    duration_index: {
      type: Number,
      required: true
    },

    start_date: {
      type: String,
      required: true
    },

    end_date: {
      type: String,
      default: null // open-ended
    },

    total_quantity: {
      type: Number,
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

dashboardSchema.index(
  { user_id: 1, duration_index: 1 },
  { unique: true }
);
export default mongoose.model("Dashboard", dashboardSchema);
