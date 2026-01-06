import cloudinary from "../../config/cloudinary.config.js";


// export const uploadDocumentService = (file) => {
//   if (!file) {
//     throw new Error("File not found");
//   }

//   return {
//     filename: file.filename,
//     originalName: file.originalname,
//     path: `uploads/${file.filename}`, // just the path, no domain
//     size: file.size,
//     mimeType: file.mimetype,
//   };
// };




// export const uploadDocumentService = async (file) => {
//   if (!file) {
//     throw new Error("File not found");
//   }

//   return new Promise((resolve, reject) => {
//     cloudinary.v2.uploader.upload_stream(
//       {
//         resource_type: "auto", 
//         folder: "documents",
//       },
//       (error, result) => {
//         if (error) return reject(error);
    
//         resolve({
//           fileName: file.originalname,
//           fileUrl: result.secure_url,
//           publicId: result.public_id,
//           size: file.size,
//           mimeType: file.mimetype,
//         });
//       }
//     ).end(file.buffer);
    
//   });
// };



// export const uploadDocumentService = async (file) => {
//   if (!file) {
//     throw new Error("File not found");
//   }

//   // Smart resource type
//   let resourceType = "raw"; // default

//   // Images → previewable
//   if (file.mimetype.startsWith("image/")) {
//     resourceType = "image";
//   }

//   // PDFs → first page preview
//   else if (file.mimetype === "application/pdf") {
//     resourceType = "image"; // Cloudinary converts first page to image preview
//   }

//   // Word / Excel → can stay as raw (or convert externally if needed)
//   else {
//     resourceType = "raw";
//   }

//   return new Promise((resolve, reject) => {
//     cloudinary.v2.uploader.upload_stream(
//       {
//         resource_type: resourceType,
//         folder: "documents",
//       },
//       (error, result) => {
//         if (error) return reject(error);

//         resolve({
//           fileName: file.originalname,
//           fileUrl: result.secure_url,
//           publicId: result.public_id,
//           size: file.size,
//           mimeType: file.mimetype,
//           resourceType, 
//         });
//       }
//     ).end(file.buffer);
//   });
// };




/**
 * Upload a file to Cloudinary and return object compatible with old frontend
 */
export const uploadDocumentService = async (file) => {
  if (!file) {
    throw new Error("File not found");
  }

  // Determine Cloudinary resource type
  let resourceType = "raw"; // default
  if (file.mimetype.startsWith("image/")) {
    resourceType = "image";
  } else if (file.mimetype === "application/pdf") {
    resourceType = "image"; // Cloudinary can generate first-page preview
  } else {
    resourceType = "raw"; // Word, Excel, ZIP, etc.
  }

  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "documents",
      },
      (error, result) => {
        if (error) return reject(error);

        // Map to frontend-compatible shape
        resolve({
          filename: file.originalname,      // used to match old 'filename'
          originalName: file.originalname,  // old frontend expected this
          path: result.secure_url,          // old 'path' now contains full URL
          size: file.size,
          mimeType: file.mimetype,
        });
      }
    ).end(file.buffer);
  });
};
