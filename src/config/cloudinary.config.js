import cloudinary from "cloudinary";

// 🔍 TEMP DEBUG (remove after confirming)
console.log("Cloudinary ENV CHECK:", {
  cloud: process.env.CLOUD_NAME,
  key: !!process.env.CLOUD_API_KEY,
  secret: !!process.env.CLOUD_API_SECRET,
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;
