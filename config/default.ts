export default {
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
  dbUrl: process.env.DB_URL,
  forgotPasswordTokenSecret: process.env.FORGOT_PASSWORD_TOKEN_SECRET,
  accessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC_KEY,
  accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY,
  accessTokenExpiry: 1000 * 60 * 60,
  refreshTokenPublicKey: process.env.REFRESH_TOKEN_PUBLIC_KEY,
  refreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY,
  refreshTokenExpiry: 1000 * 60 * 60 * 24 * 365,
  cookieMaxAge: 1000 * 60 * 60 * 24 * 365,
  mimeTypes: ["video/mp4", "video/mov"],
  chunkSize: 1000000, //1mb
};
