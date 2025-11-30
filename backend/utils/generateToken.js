import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export default generateToken;
