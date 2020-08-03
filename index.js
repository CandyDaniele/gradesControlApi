import express from 'express';
import winston from 'winston';
import {promises as fs} from 'fs';
import gradesRouter from './routes/grades.js';

const { readFile, writeFile } = fs;

global.fileName = 'grades.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new (winston.transports.Console)(), 
    new (winston.transports.File)({ filename: 'gradesControlApi.log'})
  ],
  format: combine(
    label({ label: 'gradesControlApi'}),
    timestamp(),
    myFormat
  )
});

const app = express();
app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(4000, async () => {
  try {
    await readFile(global.fileName);
    global.logger.info('API Started!');
  } catch (err) {
     global.logger.error(err);
  }
});