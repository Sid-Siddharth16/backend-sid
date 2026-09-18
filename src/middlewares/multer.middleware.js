import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },

    filename: function (req, file, cb) {
        // unique name so the same file sent in two fields doesn't collide
        cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`);
    }
});

export const upload = multer({
    storage
});