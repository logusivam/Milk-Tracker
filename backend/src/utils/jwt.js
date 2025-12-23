import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

const privateKey = fs.readFileSync(
  path.resolve("keys/private.key"),
  "utf8"
);

export const signToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
