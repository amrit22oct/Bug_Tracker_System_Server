export const allowedOrigins = process.env.ALLOWED_ORIGINS
  ?.split(",")
  .map(origin => origin.trim())
  .filter(Boolean) || [];

export const API_VERSION = process.env.API_VERSION || "v1";
