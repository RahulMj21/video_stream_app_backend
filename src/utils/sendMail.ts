import nodemailer from "nodemailer";
import config from "config";

const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transport = nodemailer.createTransport({
    host: config.get<string>("mailHost"),
    port: config.get<number>("mailPort"),
    auth: {
      user: config.get<string>("mailUser"),
      pass: config.get<string>("mailPass"),
    },
  });

  const info = await transport.sendMail({
    from: "Stream Hub",
    to,
    subject,
    html,
  });

  return info;
};

export default sendMail;
