import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadCredentials() {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../fixtures/Recruiter/Credentials.json'),
      'utf-8'
    )
  );
}
export function saveCredentials(updatedUsers) {
  const credentialsPath = path.join(
    __dirname,
    '../fixtures/Recruiter/Credentials.json'
  )
  fs.writeFileSync(credentialsPath, JSON.stringify(updatedUsers, null, 2), 'utf-8');
}
