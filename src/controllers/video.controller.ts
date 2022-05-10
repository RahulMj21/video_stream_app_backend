import fs from "fs";
import busboy from "busboy";
import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import config from "config";
import videoService from "../services/video.service";
import BigPromise from "../utils/BigPromise";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import { Video } from "../models/video.model";
import { UpdateVideoInput } from "../schemas/updateVideo.schema";
import omit from "../utils/omit";

const getFilePath = ({
  videoId,
  extension,
}: {
  videoId: Video["videoId"];
  extension: string;
}) => {
  if (!fs.existsSync(`${process.cwd()}/videos`)) {
    fs.mkdirSync(`${process.cwd()}/videos`);
  }
  return `${process.cwd()}/videos/${videoId}.${extension}`;
};

class VideoController {
  createNewVideo = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      /*
    Todo -> create video 👇👇👇👇
      * 1) initiate busboy by providing req.headers
      * 2) create video only with the creator(currentUserId)  
      * 3) listen for on"file"-event from busboy and write stream 
      * 4) listen for close-event from busboy and send response
      * 5) return req.pipe
  */
      const bb = busboy({ headers: req.headers });
      const user = get(res, "locals.user");

      const video = await videoService.createVideo(get(user, "_id"));
      if (!video) return next(CustomErrorHandler.wentWrong());

      bb.on("file", async (name, file, info) => {
        if (!config.get<string[]>("mimeTypes").includes(info.mimeType))
          return next(CustomErrorHandler.badRequest("invalid file"));

        const extension = info.mimeType.split("/")[1];
        video.extension = extension;
        await video.save({ validateBeforeSave: false });

        const filePath = getFilePath({ videoId: video.videoId, extension });

        file.pipe(fs.createWriteStream(filePath));
      });

      bb.on("close", () => {
        res.writeHead(201, {
          Connection: "close",
          "Content-Type": "application/json",
        });
        res.write(JSON.stringify(video));
        res.end();
      });

      return req.pipe(bb);
    }
  );

  updateVideo = BigPromise(
    async (
      req: Request<{ videoId: string }, {}, UpdateVideoInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      /*
    Todo -> update video 👇👇👇👇
      * 1) check the video if exists
      * 2) check if the user creator of the video  
      * 3) update and save the video 
      * 4) send response
  */
      const decodedUser = get(res, "locals.user");

      const videoId = req.params.videoId;
      const { videoTitle, videoDescription, published } = req.body;

      const video = await videoService.findVideo(videoId);
      if (!video) return next(CustomErrorHandler.notFound("video not found"));

      if (video.creator?._id.toString() !== get(decodedUser, "_id").toString())
        return next(CustomErrorHandler.unauthorized());

      video.videoTitle = videoTitle;
      video.videoDescription = videoDescription;
      video.published = published;

      video.save();

      return res.status(200).json({
        success: true,
        video: omit(video.toJSON(), ["__v"]),
      });
    }
  );

  streamVideo = BigPromise(
    async (
      req: Request<{ videoId: Video["videoId"] }>,
      res: Response,
      next: NextFunction
    ) => {
      /*
    TODO -> stream video 👇👇👇👇
      * 1) get the videoId and range from req
      * 2) check if the video exists 
      * 3) get the file path of the video
      * 4) get the fileSize,chunkStart,chunkEnd and contentLength
      * 5) set write.setHead
      * 6) createReadStream
  */
      const videoId = req.params.videoId;

      const range = req.headers.range;
      if (!range)
        return next(CustomErrorHandler.badRequest("range must be provided"));

      const video = await videoService.findVideo(videoId);
      if (!video) return next(CustomErrorHandler.notFound("video not found"));

      const filePath = getFilePath({
        videoId: video.videoId,
        extension: video.extension,
      });

      const fileSizeInBytes = fs.statSync(filePath).size;

      const chunkStart = Number(range.replace(/\D/g, ""));

      const chunkEnd = Math.min(
        chunkStart + config.get<number>("chunkSize"),
        fileSizeInBytes - 1
      );

      const contentLength = chunkEnd - chunkStart + 1;

      const headers = {
        "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${fileSizeInBytes}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": `video/${video.extension}`,
        "Cross-Origin-Resource-Policy": "cross-origin",
      };

      res.writeHead(206, headers);

      const videoStream = fs.createReadStream(filePath, {
        start: chunkStart,
        end: chunkEnd,
      });

      videoStream.pipe(res);
    }
  );

  getAllVideos = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const videos = await videoService.findAllVideos({
        published: true,
      });
      if (!videos) return next(CustomErrorHandler.notFound("videos not found"));

      return res.status(200).json({
        success: true,
        videos,
      });
    }
  );

  getMyAllVideos = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const decodedUser = get(res, "locals.user");
      if (!decodedUser) return next(CustomErrorHandler.unauthorized());

      const videos = await videoService.findAllVideos({
        creator: get(decodedUser, "_id"),
      });
      if (!videos) return next(CustomErrorHandler.notFound("videos not found"));

      return res.status(200).json({
        success: true,
        videos,
      });
    }
  );

  getUsersAllVideos = BigPromise(
    async (
      req: Request<{ userId: string }>,
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.params.userId;
      const videos = await videoService.findAllVideos({
        creator: userId,
        published: true,
      });
      if (!videos) return next(CustomErrorHandler.notFound("videos not found"));

      return res.status(200).json({
        success: true,
        videos,
      });
    }
  );

  getSingleVideo = BigPromise(
    async (
      req: Request<{ videoId: string }>,
      res: Response,
      next: NextFunction
    ) => {
      const videoId = req.params.videoId;
      const video = await videoService.findVideo(videoId);
      if (!video) return next(CustomErrorHandler.notFound());

      return res.status(200).json({
        success: true,
        video: video.toJSON(),
      });
    }
  );

  deleteVideo = BigPromise(
    async (
      req: Request<{ vidoeId: string }>,
      res: Response,
      next: NextFunction
    ) => {
      const videoId = req.params.vidoeId;
      const decodedUser = get(res, "locals.user");
      if (!decodedUser) return next(CustomErrorHandler.unauthorized());

      const video = await videoService.findVideo(videoId);
      if (!video) return next(CustomErrorHandler.notFound("video not found"));

      if (String(get(video, "creator._id")) !== String(get(decodedUser, "_id")))
        return next(CustomErrorHandler.unauthorized());

      video.remove();

      return res.status(200).json({
        success: true,
        message: "video deleted",
      });
    }
  );
}

export default new VideoController();
