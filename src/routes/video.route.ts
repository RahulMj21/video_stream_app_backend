import { Router } from "express";
import videoController from "../controllers/video.controller";
import deserializeUser from "../middlewares/deserializeUser";
import validateResources from "../middlewares/validateResources";
import { UpdateVideoSchema } from "../schemas/updateVideo.schema";
const router = Router();

router.route("/new").post(deserializeUser, videoController.createNewVideo);

router
  .route("/update/:videoId")
  .put(
    deserializeUser,
    validateResources(UpdateVideoSchema),
    videoController.updateVideo
  );

router.route("/all").get(deserializeUser, videoController.getAllVideos);
router.route("/own").get(deserializeUser, videoController.getMyAllVideos);
router
  .route("/all/:userId")
  .get(deserializeUser, videoController.getUsersAllVideos);
router
  .route("/:videoId")
  .get(deserializeUser, videoController.getSingleVideo)
  .delete(deserializeUser, videoController.deleteVideo);

export default router;
