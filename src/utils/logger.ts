import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "bgRed white",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

export const logger = winston.createLogger({
  level: "debug",
  levels,
  format,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/all.log" }),
  ],
});

export const log = {
  info: (message: string) => {
    logger.info(message);
  },
  error: (message: string, error?: any) => {
    if (error) {
      logger.error(`${message} - ${error.message || error}`);
      logger.debug(error.stack || error);
    } else {
      logger.error(message);
    }
  },
  warn: (message: string) => {
    logger.warn(message);
  },
  debug: (message: string) => {
    logger.debug(message);
  },
  http: (message: string) => {
    logger.http(message);
  },
};
