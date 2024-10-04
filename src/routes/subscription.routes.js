import { Router } from 'express';
import {
    getSubscribedChannels,
    getSubscribersUsers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { get } from 'mongoose';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .post(toggleSubscription);

router.route("/u/:userId/getSubscriber").get(getSubscribersUsers);
router.route("/u/:userId/getChannel").get(getSubscribedChannels);

export default router