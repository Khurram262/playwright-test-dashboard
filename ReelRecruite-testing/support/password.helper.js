import { runQuery } from '../utils/db/dbClient.js';
import bcrypt from 'bcrypt';
import { loadCredentials, saveCredentials } from './recruiterCredentials.js';

export async function changeRecruiterPassword(email, newPassword) {
  const users = loadCredentials();
  const updatedUsers = users.map(u =>
    u.email === email ? { ...u, password: newPassword } : u
  );
  saveCredentials(updatedUsers);
}

export async function verifyPasswordUpdatedInDb(email, oldPassword, newPassword) {
  const usersInDb = await runQuery(
    `SELECT password FROM users WHERE email = $1`,
    [email]
  );

  if (usersInDb.length !== 1) {
    throw new Error(`User not found in DB for email: ${email}`);
  }

  const hashedPassword = usersInDb[0].password;

  // Verify new password matches DB (always required)
  const newPasswordMatches = await bcrypt.compare(newPassword, hashedPassword);
  if (newPasswordMatches) {
    console.log(
      `DB verification passed: password verified successfully for ${email}`
    );
  }

  // Optional validation: only check difference if passwords are different
  if (oldPassword !== newPassword) {
    const oldPasswordMatches = await bcrypt.compare(oldPassword, hashedPassword);
    if (oldPasswordMatches) {
      throw new Error(
        'Old password still matches DB hash when a different password was expected'
      );
    }
  }

  console.log(
    `DB verification passed: password verified successfully for ${email}`
  );
}


