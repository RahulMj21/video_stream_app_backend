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
  return `${process.cwd()}/videos/${videoId}.${extension}`;
};

class VideoController {
  /*
    Todo -> create video 👇👇👇👇
      * 1) initiate busboy by providing req.headers
      * 2) create video only with the creator(currentUserId)  
      * 3) listen for on"file"-event from busboy and write stream 
      * 4) listen for close-event from busboy and send response
      * 5) return req.pipe
  */
  createNewVideo = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = get(res, "locals.user");

      const bb = busboy({ headers: req.headers });

      const video = await videoService.createVideo(get(user, "_id"));
      if (!video) return next(CustomErrorHandler.wentWrong());

      bb.on("file", (_, file, info) => {
        if (!config.get<string[]>("mimeTypes").includes(info.mimeType))
          return next(CustomErrorHandler.badRequest("invalid file"));

        const extension = info.mimeType.split("/")[1];
        video.extension = extension;
        video.save();

        const filePath = getFilePath({ videoId: video.videoId, extension });

        const stream = fs.createWriteStream(filePath);

        file.pipe(stream);
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
  /*
    Todo -> update video 👇👇👇👇
      * 1) check the video if exists
      * 2) check if the user creator of the video  
      * 3) update and save the video 
      * 4) send response
  */
  updateVideo = BigPromise(
    async (
      req: Request<{ videoId: string }, {}, UpdateVideoInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      const decodedUser = get(res, "locals.user");

      const videoId = req.params.videoId;
      const { videoTitle, videoDescription, published } = req.body;

      const video = await videoService.findVideo(videoId);
      if (!video) return next(CustomErrorHandler.notFound("video not found"));

      if (String(video.creator) !== get(decodedUser, "_id"))
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

  /*
    Todo -> stream video 👇👇👇👇
      * 1) get the videoId and range from req
      * 2) check if the video exists 
      * 3) get the file path of the video
      * 4) get the fileSize,chunkStart,chunkEnd and contentLength
      * 5) set write.setHead
      * 6) createReadStream
  */
  streamVideo = BigPromise(
    async (
      req: Request<{ videoId: Video["videoId"] }>,
      res: Response,
      next: NextFunction
    ) => {
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
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  getUsersAllVideos = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  getSingleVideo = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  deleteVideo = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}

export default new VideoController();
