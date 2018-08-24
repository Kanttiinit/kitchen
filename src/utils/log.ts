import * as winston from 'winston';
const { combine, printf, timestamp, colorize, json } = winston.format;

const logger = winston.createLogger({
  format: timestamp(),
  transports: [
    new winston.transports.File({
      format: json(),
      filename: 'log.log',
      maxsize: 8192,
      maxFiles: 10
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        printf(
          info =>
            `${info.timestamp} [${info.level}] ${info.task}: ${info.message} (${
              info.value
            })`
        )
      )
    })
  );
}

export const log = (
  level: string,
  task: string,
  message: string,
  value: string | number
) => {
  logger.log({
    level,
    message,
    task,
    value
  });
};
