import { runQuery } from "../utils/db/dbClient.js";

export async function getUserByEmail(email) {
  const rows = await runQuery(
    `SELECT id, email, full_name, title, bio, avatar_url, cover_url, location, phone, country, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  const result = rows[0];
  console.log('[candidateDb] getUserByEmail:', { email, id: result && result.id, full_name: result && result.full_name, country: result && result.country });
  return result;
}


export async function getUserById(userId) {
  const rows = await runQuery(
    `SELECT id, email, full_name, title, bio, avatar_url, cover_url, location, phone, updated_at FROM users WHERE id = $1`,
    [userId]
  );
  const result = rows[0];
  console.log('[recruiterDb] getUserById:', { userId, email: result && result.email, full_name: result && result.full_name });
  return result;
}

export async function getCompanyProfileByUserId(userId) {
  const rows = await runQuery(
    `SELECT id, user_id, company_name, company_slug, is_verified, industry, company_size, founded_year, website, logo_url, banner_url, description, tagline, headquarters, locations, linkedin_url, twitter_url, facebook_url, contact_email, contact_phone, updated_at FROM company_profiles WHERE user_id = $1`,
    [userId]
  );
  const result = rows[0];
  console.log('[recruiterDb] getCompanyProfileByUserId:', { userId, company_name: result && result.company_name, updated_at: result && result.updated_at });
  return result;
}

export async function getCompanyProfileByEmail(email) {
  const rows = await runQuery(
    `SELECT cp.id, cp.user_id, cp.company_name, cp.company_slug, cp.description, cp.website, cp.logo_url, cp.banner_url, cp.tagline, cp.locations, cp.updated_at FROM company_profiles cp JOIN users u ON cp.user_id = u.id WHERE u.email = $1`,
    [email]
    
  );
  const result = rows[0];
  console.log('[recruiterDb] getCompanyProfileByEmail:', { email, company_name: result && result.company_name, updated_at: result && result.updated_at });
  return result;
}

export async function getRecruiterPublicFieldsByEmail(email) {
  const rows = await runQuery(
    `SELECT u.id, u.full_name, u.title, u.bio, u.avatar_url, u.cover_url, u.location, u.updated_at, cp.company_name, cp.tagline FROM users u LEFT JOIN company_profiles cp ON cp.user_id = u.id WHERE u.email = $1`,
    [email]
  );
  const result = rows[0];
  console.log('[recruiterDb] getRecruiterPublicFieldsByEmail:', { email, id: result && result.id, full_name: result && result.full_name, company_name: result && result.company_name });
  return result;
}
