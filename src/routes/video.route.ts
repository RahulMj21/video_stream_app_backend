import { Router } from "express";
import videoController from "../controllers/video.controller";
import deserializeUser from "../middlewares/deserializeUser";
import validateResources from "../middlewares/validateResources";
import { UpdateVideoSchema } from "../schemas/updateVideo.schema";
const router = Router();

router.route("/new").post(deserializeUser, videoController.createNewVideo);

router
  .route("/update")
  .put(
    deserializeUser,
    validateResources(UpdateVideoSchema),
    videoController.createNewVideo
  );

export default router;
