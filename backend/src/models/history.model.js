import mongoose from "mongoose";

const historyItemSchema = new mongoose.Schema(
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
      type: Number, // cost for that date
      required: true
    }
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
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
      default: null
    },

    overall_quantity: {
      type: Number,
      default: 0
    },

    overall_cost: {
      type: Number,
      default: 0
    },

    history: {
      type: [historyItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

/* 🔒 Prevent duplicate history docs per duration */
historySchema.index(
  { user_id: 1, duration_index: 1 },
  { unique: true }
);

export default mongoose.model("History_data", historySchema);
