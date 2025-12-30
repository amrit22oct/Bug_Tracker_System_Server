import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs-extra";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
fs.ensureDirSync(logDir);

/* 🧾 File log format (readable) */
const fileFormat = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕒 Time    : ${timestamp}
📌 Level   : ${level.toUpperCase()}
📄 Message : ${message}
📦 Data    : ${JSON.stringify(meta, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
);

/* 🖥 Terminal format */
const consoleFormat = winston.format.printf(
   ({ timestamp, level, message, ...meta }) => {
     const base =
       `${timestamp} ${level.toUpperCase()} ➜ ${message}`;
 
     const requestInfo = meta.method
       ? `\n  🔹 ${meta.method} ${meta.url}`
       : "";
 
     const statusInfo = meta.statusCode
       ? `\n  🔹 Status: ${meta.statusCode} | Time: ${meta.responseTime}`
       : "";
 
     const responseInfo =
       meta.responseBody
         ? `\n  🔹 Response:\n${JSON.stringify(meta.responseBody, null, 2)}`
         : "";
 
     return `${base}${requestInfo}${statusInfo}${responseInfo}\n`;
   }
 );
 

const logger = winston.createLogger({
  level: "info",
  format: winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  transports: [
    // ✅ TERMINAL OUTPUT
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        consoleFormat
      ),
    }),

    // ✅ DATE-WISE SERVER LOG FILE
    new DailyRotateFile({
      filename: path.join(logDir, "server-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "7d",
      maxSize: "20m",
      format: fileFormat,
    }),

    // ❌ ERROR LOG FILE
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
      format: fileFormat,
    }),
  ],
});

export default logger;
