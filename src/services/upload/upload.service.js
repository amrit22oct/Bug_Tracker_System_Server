export const uploadDocumentService = (file) => {
  if (!file) {
    throw new Error("File not found");
  }

  return {
    filename: file.filename,
    originalName: file.originalname,
    path: `uploads/${file.filename}`, // just the path, no domain
    size: file.size,
    mimeType: file.mimetype,
  };
};
