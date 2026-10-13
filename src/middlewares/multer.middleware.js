import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// Cloudinary's standard upload API accepts files up to 100 MB
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

// fields that carry a video; every other upload field is an image
const VIDEO_FIELDS = ["videoFile"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },

    filename: function (req, file, cb) {
        // unique name so the same file sent in two fields doesn't collide
        cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const expected = VIDEO_FIELDS.includes(file.fieldname) ? "video/" : "image/";
    if (file.mimetype.startsWith(expected)) return cb(null, true);
    cb(new ApiError(400, `${file.fieldname} must be a ${expected.slice(0, -1)} file`));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_BYTES }
});
