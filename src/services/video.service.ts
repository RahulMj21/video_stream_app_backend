import videoModel, { Video } from "../models/video.model";
import { FilterQuery } from "mongoose";
import omit from "../utils/omit";

class VideoService {
  createVideo = async (creator: Video["creator"]) => {
    try {
      return await videoModel.create({ creator });
    } catch (error: any) {
      return false;
    }
  };

  findVideo = async (videoId: Video["videoId"]) => {
    try {
      return await videoModel
        .findOne({ videoId })
        .select("-__v")
        .populate({ path: "creator", select: "name _id email" });
    } catch (error: any) {
      return false;
    }
  };

  findAllVideos = async (query: FilterQuery<Video> | {} = {}) => {
    try {
      const videos = await videoModel
        .find(query)
        .select("-__v")
        .populate({ path: "creator", select: "name _id email" });

      if (videos.length < 1) return [];

      return videos.map((video) => video.toJSON());
    } catch (error: any) {
      return false;
    }
  };
}

export default new VideoService();
