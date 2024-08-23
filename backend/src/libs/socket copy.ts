import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import User from "../models/User";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

function tokenIsValid(token: string): boolean {
    try {
      try {
        verify(token, authConfig.secret);

        return true;
      } catch (err) {
        if (
          err.name === "JsonWebTokenError" ||
          err.name === "TokenExpiredError"
        ) {
          return false;
        }
        throw new AppError(
          "Invalid token. We'll try to assign a new one on next request",
          403
        );
      }
    } catch (error) {
      return false;
    }
  }

  io.use((socket, next) => {
    const token = socket.handshake.query.token as string;

    if (!token) {
      return next(new Error("Unauthorized: Token not provided"));
    }

    if (!tokenIsValid(token)) {
      return next(new Error("Unauthorized: Invalid token"));
    }
    return next();
  });

  io.on("connection", async socket => {
    logger.info("Client Connected");
    const { userId } = socket.handshake.query;

    if (userId && userId !== "undefined" && userId !== "null") {
      const user = await User.findByPk(userId);
      if (user) {
        user.online = true;
        await user.save();
      }
    }

    socket.on("joinChatBox", (ticketId: string) => {
      logger.info("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("A client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.info(`A client joined to ${status} tickets channel.`);
      socket.join(status);
    });
  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
