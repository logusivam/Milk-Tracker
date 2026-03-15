const isProd = location.hostname !== "localhost";

const noop = () => {};

export const logger = {
  log: isProd ? noop : console.log.bind(console),
  warn: isProd ? noop : console.warn.bind(console),
  error: isProd ? noop : console.error.bind(console),
  info: isProd ? noop : console.info.bind(console)
};
