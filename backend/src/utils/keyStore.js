export const keyStore = {
  "milk-key-v1": {
    privateKey: Buffer.from(process.env.JWT_PRIVATE_KEY, "base64").toString("utf8"),
    publicKey: Buffer.from(process.env.JWT_PUBLIC_KEY, "base64").toString("utf8"),
    active: true
  }
};