import {Router} from 'express';
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { loggedOutUser, dashboardUser,loginUser, refreshAccessToken, registerUser, editProfile } from '../controllers/user.controller.js';

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
    registerUser
)

router.route("/login").post(
    loginUser
)

//secured routes

router.route("/logout").post(verifyJWT, loggedOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/dashboard").get(verifyJWT, dashboardUser)

router.route("/edit-profile").put(verifyJWT, editProfile)



export default router;