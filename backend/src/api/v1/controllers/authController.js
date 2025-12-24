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
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const jti = crypto.randomUUID();

    await RefreshToken.create({
      tokenId: jti,
      userId: user._id,
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const accessToken = signAccessToken({
      id: user._id,
      email: user.email
    });

    const refreshToken = signRefreshToken({
      id: user._id,
      jti
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "None",
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};

/* ======================
   REFRESH TOKEN
====================== */
export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const payload = verifyToken(token);

    // ✅ must exist AND not revoked AND not expired
    const stored = await RefreshToken.findOne({
      tokenId: payload.jti,
      revoked: false
    });

    if (!stored) return res.sendStatus(403);

    if (stored.expiresAt <= new Date()) {
      stored.revoked = true;
      await stored.save();
      return res.sendStatus(403);
    }

    // 🔄 rotate refresh token
    stored.revoked = true;
    await stored.save();

    const newJti = crypto.randomUUID();

    await RefreshToken.create({
      tokenId: newJti,
      userId: payload.id,
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const newAccessToken = signAccessToken({ id: payload.id });

    const newRefreshToken = signRefreshToken({
      id: payload.id,
      jti: newJti
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/"
    };

    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.sendStatus(403);
  }
};

/* ======================
   LOGOUT
====================== */
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204);

    const payload = verifyToken(token);

    // 🔐 revoke refresh token → blocks ALL future access
    await RefreshToken.updateOne(
      { tokenId: payload.jti },
      { revoked: true }
    );

    res.clearCookie("refreshToken", {
      path: "/",
      // clearCookie may require the same security/sameSite attributes in some environments
      secure: process.env.NODE_ENV === "production",
      sameSite: "None"
    });

    res.sendStatus(204);
  } catch {
    res.sendStatus(204);
  }
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
