import dayjs from 'dayjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const logFilePath = path.join(process.cwd(), 'logs', `${dayjs().format('YYYY-MM-DD')}.log`);

export default function log(message: string): void {
  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  logToFile(logMessage);
}

async function logToFile(message: string) {
  try {
    // Create the file and directory if they don't exist
    await fs.mkdir(path.dirname(logFilePath), { recursive: true });
    await fs.appendFile(logFilePath, message);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to write log message: ${error.message}`);
      return;
    }
    console.error(`Failed to write log message: ${JSON.stringify(error)}`);
  }
}
