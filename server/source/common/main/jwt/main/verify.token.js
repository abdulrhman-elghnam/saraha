import jwt from "jsonwebtoken"
import { config } from "../../../../../configuration";
export const verifyToken = (token) => {
  return jwt.verify(
    token,
    config.JWT_SECRET_KEY
  );
};