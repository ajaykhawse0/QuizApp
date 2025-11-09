const multer = require('multer');

// For images (small files)
const memoryStorage = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // ✅ always safe on Render
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage })

module.exports={upload};