import videoModel, { Video } from "../models/video.model";

class VideoService {
  createVideo = async (creator: Video["creator"]) => {
    try {
      return await videoModel.create({ creator });
    } catch (error: any) {
      return false;
    }
  };
}

export default new VideoService();
