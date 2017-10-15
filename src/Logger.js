import winston from 'winston';

export default (name) => {
  return winston.loggers.add(name, {
    console: {
      label: name,
    }
  });
}