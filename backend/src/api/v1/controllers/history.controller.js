import History from "../../../models/history.model.js";

export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const histories = await History.find({ user_id: userId })
      .sort({ duration_index: 1 })
      .lean();

    res.json(histories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};
