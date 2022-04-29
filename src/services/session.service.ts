import sessionModel, { Session } from "../models/session.model";
import { FilterQuery } from "mongoose";

class SessionService {
  createSession = async (input: Session) => {
    try {
      return await sessionModel.create(input);
    } catch (error: any) {
      return false;
    }
  };
  findSession = async (query: FilterQuery<Session>) => {
    try {
      return await sessionModel.findOne(query);
    } catch (error: any) {
      return false;
    }
  };
  findAllSessions = async (userId: Session["userId"]) => {
    try {
      return await sessionModel.find({ userId });
    } catch (error: any) {
      return false;
    }
  };
  upsertSession = async (query: FilterQuery<Session>, update: Session) => {
    try {
      return await sessionModel.findOneAndUpdate(query, update, {
        new: true,
        upsert: true,
      });
    } catch (error: any) {
      return false;
    }
  };
}

export default new SessionService();
