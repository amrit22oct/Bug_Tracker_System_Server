import jwt from "jsonwebtoken";

// Generate username automatically
export const generateUsername = (email) => {
  const namePart = email.split("@")[0];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${namePart}${randomNum}`;
};

// Generate JWT
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};
