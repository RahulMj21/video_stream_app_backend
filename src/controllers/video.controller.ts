import fs from "fs";
import busboy from "busboy";
import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import config from "config";
import videoService from "../services/video.service";
import BigPromise from "../utils/BigPromise";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import { Video } from "../models/video.model";

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
      * 3) listen for file-event from busboy and write stream 
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
  updateVideo = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  getAllVideos = BigPromise(
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
