import cloudinary from "../../config/cloudinary.config.js";
import { supabase } from "../../config/supabase.js";

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

// export const uploadDocumentService = async (file) => {
//   if (!file) {
//     throw new Error("File not found");
//   }

//   // Determine Cloudinary resource type
//   let resourceType = "raw"; // default
//   if (file.mimetype.startsWith("image/")) {
//     resourceType = "image";        // images stay as images
//   } else if (file.mimetype === "application/pdf") {
//     resourceType = "raw";          // PDFs must be raw to preserve format
//   } else {
//     resourceType = "raw";          // Word, Excel, ZIP, etc.
//   }

//   return new Promise((resolve, reject) => {
//     cloudinary.v2.uploader.upload_stream(
//       {
//         resource_type: resourceType,
//         folder: "documents",
//       },
//       (error, result) => {
//         if (error) return reject(error);

//         // Build frontend-friendly file object
//         let fileUrl = result.secure_url;

//         // If PDF → generate inline-viewable URL
//         if (file.mimetype === "application/pdf") {
//           // Add fl_attachment:false flag and ensure .pdf extension
//           if (!fileUrl.endsWith(".pdf")) {
//             fileUrl += ".pdf";
//           }
//           fileUrl = fileUrl.replace("/upload/", "/upload/fl_attachment:false/");
//         }

//         resolve({
//           filename: file.originalname,
//           originalName: file.originalname,
//           path: fileUrl,        // direct URL usable in browser
//           size: file.size,
//           mimeType: file.mimetype,
//         });
//       }
//     ).end(file.buffer);
//   });
// };

// export const uploadDocumentService = async (file) => {
//   if (!file) throw new Error("File not found");

//   let resourceType = "raw";

//   if (file.mimetype.startsWith("image/")) {
//     resourceType = "image";
//   } else if (file.mimetype === "application/pdf") {
//     resourceType = "image"; // REQUIRED
//   }

//   return new Promise((resolve, reject) => {
//     cloudinary.v2.uploader.upload_stream(
//       {
//         resource_type: resourceType,
//         folder: "documents",
//         use_filename: true,
//         unique_filename: true,
//       },
//       (error, result) => {
//         if (error) return reject(error);

//         let fileUrl = result.secure_url;

//         // ✅ FIX FOR PDF VIEWING
//         if (file.mimetype === "application/pdf") {
//           fileUrl = result.secure_url
//             .replace("/upload/", "/upload/pg_1/")
//             .replace(".pdf", ".jpg");
//         }

//         resolve({
//           filename: file.originalname,
//           originalName: file.originalname,
//           path: fileUrl, // ✅ iframe & browser safe
//           size: file.size,
//           mimeType: file.mimetype,
//         });
//       }
//     ).end(file.buffer);
//   });
// };

// supabase.js

export const uploadDocumentService = async (file) => {
  if (!file) throw new Error("File not found");

  /* ================= IMAGES → CLOUDINARY ================= */
  if (file.mimetype.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "documents",
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              filename: file.originalname,
              originalName: file.originalname,
              path: result.secure_url, // ✅ works everywhere
              size: file.size,
              mimeType: file.mimetype,
            });
          }
        )
        .end(file.buffer);
    });
  }

  /* ================= PDFs → SUPABASE ================= */
  if (file.mimetype === "application/pdf") {
    const fileName = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("documents") // bucket name
      .upload(fileName, file.buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("documents").getPublicUrl(fileName);

    return {
      filename: file.originalname,
      originalName: file.originalname,
      path: data.publicUrl, // ✅ iframe + browser viewable PDF
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /* ================= OTHER FILES (OPTIONAL) ================= */
  throw new Error("Unsupported file type");
};
