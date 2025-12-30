import logger from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

const requestLogger = (req, res, next) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  const originalSend = res.send;
  let responseBody;

  res.send = function (body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const logPayload = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip,
      requestBody: req.body,
      responseBody,
    };

    if (res.statusCode >= 500) {
      logger.error("SERVER ERROR", logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn("CLIENT ERROR", logPayload);
    } else {
      logger.info("REQUEST SUCCESS", logPayload);
    }
  });

  next();
};

export default requestLogger;
