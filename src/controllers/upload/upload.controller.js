// import { uploadDocumentService } from "../../services/upload/upload.service.js";

// export const uploadDocumentController = (req, res) => {
//   try {
//     const fileData = uploadDocumentService(req.file);

//     return res.status(200).json({
//       success: true,
//       message: "File uploaded successfully",
//       data: fileData,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


import { uploadDocumentService } from "../../services/upload/upload.service.js";

export const uploadDocumentController = async (req, res) => {
  try {
    const fileData = await uploadDocumentService(req.file);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: fileData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
