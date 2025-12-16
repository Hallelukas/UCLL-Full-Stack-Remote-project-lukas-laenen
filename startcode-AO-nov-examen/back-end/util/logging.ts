import { logger } from "./logger";

const logEvent = (event: string, data: {
  message: string;
  user?: string;
  ip?: string;
  url?: string;
  status?: string;
  error?: string;
}) => {
  logger.log({
    level: data.error ? "error" : (event.includes("Failed") ? "warn" : "info"),
    event,
    ...data
  });
}

export { logEvent };