import videoModel, { Video } from "../models/video.model";
import omit from "../utils/omit";

class VideoService {
  createVideo = async (creator: Video["creator"]) => {
    try {
      return await videoModel.create({ creator });
    } catch (error: any) {
      return false;
    }
  };

  findVideo = async (videoId: string) => {
    try {
      return await videoModel.findOne({ videoId });
    } catch (error: any) {
      return false;
    }
  };
}

export default new VideoService();
