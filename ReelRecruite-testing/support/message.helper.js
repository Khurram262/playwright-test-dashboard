import fs from 'fs';
import path from 'path';


const RANDOM_MESSAGES_FILE = path.join(
  process.cwd(),
  'fixtures/Recruiter/randomMessages.json'
);

 export function getRandomMessage() {
  const data = fs.readFileSync(RANDOM_MESSAGES_FILE, 'utf-8');
  const messages = JSON.parse(data);

  if (!messages.length) {
    throw new Error('No messages found in randomMessages.json');
  }

  return messages[Math.floor(Math.random() * messages.length)];
}