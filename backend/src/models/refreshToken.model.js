import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model("RefreshToken", refreshTokenSchema);