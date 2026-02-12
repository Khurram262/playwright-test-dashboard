import fs from 'fs';
import path from 'path';

const NEW_USERS_FILE = path.join(process.cwd(), 'fixtures/users/NewUsers.json');
const PASSWORD = 'Test@12345';

/**
 * Generate a single unique user for signup
 */
export function getRandomUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  const uniqueId = `${timestamp}${random}`;

  return {
    fullName: `User ${uniqueId.slice(-4)}`,
    email: `user${uniqueId}@gmail.com`,
    phone: `3${uniqueId.slice(-9)}`,
    password: PASSWORD
  };
}

/**
 * Persist successfully signed-up user
 */
export function storeNewUser(user) {
  if (!user?.email || !user?.phone) {
    throw new Error('Invalid user object. Cannot store user.');
  }

  const users = fs.existsSync(NEW_USERS_FILE)
    ? JSON.parse(fs.readFileSync(NEW_USERS_FILE, 'utf-8'))
    : [];

  users.push(user);

  fs.writeFileSync(
    NEW_USERS_FILE,
    JSON.stringify(users, null, 2),
    'utf-8'
  );
}
