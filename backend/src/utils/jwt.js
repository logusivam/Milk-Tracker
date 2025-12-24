import jwt from "jsonwebtoken";
import { keyStore } from "./keyStore.js";

const CURRENT_KID = process.env.JWT_KID_CURRENT;

export const signAccessToken = (payload) => {
  const key = keyStore[CURRENT_KID];

  return jwt.sign(payload, key.privateKey, {
    algorithm: "RS256",
    expiresIn: process.env.JWT_EXPIRES_IN,
    header: { kid: CURRENT_KID }
  });
};

export const signRefreshToken = (payload) => {
  const key = keyStore[CURRENT_KID];

  return jwt.sign(payload, key.privateKey, {
    algorithm: "RS256",
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    header: { kid: CURRENT_KID }
  });
};

export const verifyToken = (token) => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) throw new Error("Invalid token");

  const key = keyStore[decoded.header.kid];
  if (!key) throw new Error("Unknown key id");

  return jwt.verify(token, key.publicKey, {
    algorithms: ["RS256"]
  });
};
