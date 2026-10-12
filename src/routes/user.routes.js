import {Router} from 'express';
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, editProfileSchema } from '../validators/user.validator.js';
import { loggedOutUser, dashboardUser,loginUser, refreshAccessToken, registerUser, editProfile } from '../controllers/user.controller.js';
import { home } from '../controllers/home.controller.js';
const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    validate(registerSchema),
    registerUser
)

router.route("/login").post(
    loginUser
)

//secured routes

router.route("/logout").post(verifyJWT, loggedOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/home").get(verifyJWT, home)
router.route("/profile").get(verifyJWT, dashboardUser)

router.route("/edit-profile").patch(verifyJWT, validate(editProfileSchema), editProfile)



export default router;