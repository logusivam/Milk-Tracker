import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../../models/user.model.js";
import RefreshToken from "../../../models/refreshToken.model.js";
import TokenBlacklist from "../../../models/tokenBlacklist.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken
} from "../../../utils/jwt.js";

/* ======================
   REGISTER (UNCHANGED)
====================== */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ======================
   LOGIN
====================== */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const jti = crypto.randomUUID();

  // 🔒 Revoke ALL previous refresh tokens (single-session policy)
  await RefreshToken.updateMany(
    { userId: user._id },
    { revoked: true }
  );

  await RefreshToken.create({
    tokenId: jti,
    userId: user._id,
    revoked: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  console.info("Created refresh token entry for user", String(user._id), "jti:", jti);

  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id, jti });

  const isProd = process.env.NODE_ENV === "production";

  // 🧹 CLEAR any old cookie FIRST
  res.clearCookie("refreshToken", {
    path: "/",
    secure: isProd,
    sameSite: isProd ? "None" : "Lax"
  });

  // 🍪 SET correct cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken });
};



/* ======================
   REFRESH TOKEN
====================== */
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.sendStatus(401);

    const payload = verifyToken(token);
    console.info("Incoming refresh jti:", payload.jti);

    const stored = await RefreshToken.findOne({
      tokenId: payload.jti,
      revoked: false
    });

    if (!stored) {
      console.warn("Refresh token not found or revoked:", payload.jti);
      return res.sendStatus(403);
    }

    if (stored.expiresAt <= new Date()) {
      stored.revoked = true;
      await stored.save();
      return res.sendStatus(403);
    }

    const newAccessToken = signAccessToken({ id: payload.id });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.sendStatus(403);
  }
};



/* ======================
   LOGOUT
====================== */
export const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    path: "/",
    secure: isProd,
    sameSite: isProd ? "None" : "Lax"
  });

  res.sendStatus(204);
};



/* ======================
   ME (ACCESS TOKEN VALIDATION)
====================== */
export const me = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.sendStatus(401);
    }

    const token = auth.split(" ")[1];
    const payload = verifyToken(token);

    const user = await User.findById(payload.id).select("_id email name");
    if (!user) return res.sendStatus(401);

    res.json({ user });
  } catch {
    res.sendStatus(401);
  }
};
