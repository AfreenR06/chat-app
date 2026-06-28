import { getAuth } from "@clerk/express";
import User from "../models/User.model.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    console.log("Clerk User ID:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({
      clerkId: userId,
    });

    console.log("Mongo User:", user);

    if (!user) {
      return res.status(404).json({
        message: "User profile is not synced yet",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Protect Route Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}