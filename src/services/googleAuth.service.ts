import config from "config";
import axios from "axios";
import qs from "qs";
import logger from "../utils/logger";

export interface GoogleUserTokens {
  access_token: string;
  refrest_token: string;
  id_token: string;
  scope: string;
  expires_in: number;
}
export interface GoogleUserDetails {
  id: string;
  name: string;
  email: string;
  verified_email: Boolean;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

class GoogleService {
  getGoogleUserTokens = async (code: string): Promise<GoogleUserTokens> => {
    try {
      const token_uri = config.get<string>("googleTokenUri");
      const options = {
        code,
        client_id: config.get<string>("googleClientId"),
        client_secret: config.get<string>("googleClientSecret"),
        redirect_uri: config.get<string>("googleRedirectUri"),
        grant_type: "authorization_code",
      };
      const query = qs.stringify(options);

      const res = await axios.post<GoogleUserTokens>(token_uri, query, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return res.data;
    } catch (error: any) {
      logger.error(error, "google data fetching error");
      throw new Error("google data fetching error---> " + error);
    }
  };

  getGoogleUserDetails = async (
    access_token: string,
    id_token: string
  ): Promise<GoogleUserDetails> => {
    try {
      const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`;

      const res = await axios.get<GoogleUserDetails>(url, {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      });

      return res.data;
    } catch (error: any) {
      logger.error(error, "google data fetching error");
      throw new Error("google data fetching error---> " + error.message);
    }
  };
}

export default new GoogleService();
