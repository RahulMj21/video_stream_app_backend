import { Request, Response, Router } from "express";

const router = Router();

router.route("/healthcheck").get(async (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "all good" });
});

export default router;
