const multer = require("multer");

// Use memoryStorage so file buffers are kept in RAM and never written to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt =
    file.originalname && file.originalname.toLowerCase().endsWith(".pdf");

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF files are allowed. Please upload a valid PDF document."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max file size
  },
});

module.exports = upload;
