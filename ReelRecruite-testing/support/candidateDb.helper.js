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
  console.log('[candidateDb] getUserById:', { userId, email: result && result.email, full_name: result && result.full_name });
  return result;
}

export async function getCandidateProfileByUserId(userId) {
  const rows = await runQuery(
    `SELECT id, user_id, years_of_experience, skills, resume_url, portfolio_url, cover_video, salary_expectation, preferred_locations, preferred_job_types, preferred_work_types, willing_to_relocate, is_actively_looking, available_from, notice_period, linkedin_url, github_url, portfolio_website, education, work_experience, updated_at FROM candidate_profiles WHERE user_id = $1`,
    [userId]
  );
  const result = rows[0];
  console.log('[candidateDb] getCandidateProfileByUserId:', { userId, id: result && result.id, updated_at: result && result.updated_at });
  return result;
}

export async function getCandidateProfileByEmail(email) {
  const rows = await runQuery(
    `SELECT cp.* FROM candidate_profiles cp JOIN users u ON cp.user_id = u.id WHERE u.email = $1`,
    [email]
  );
  const result = rows[0];
  console.log('[candidateDb] getCandidateProfileByEmail:', { email, id: result && result.id, user_id: result && result.user_id });
  return result;
}

export async function getCandidateSkills(userId) {
  const rows = await runQuery(`SELECT skills FROM candidate_profiles WHERE user_id = $1`, [userId]);
  const skills = rows[0] ? rows[0].skills : null;
  console.log('[candidateDb] getCandidateSkills:', { userId, skills });
  return skills;
}

export async function getCandidateEducation(userId) {
  const rows = await runQuery(`SELECT education FROM candidate_profiles WHERE user_id = $1`, [userId]);
  const education = rows[0] ? rows[0].education : null;
  console.log('[candidateDb] getCandidateEducation:', { userId, educationPresent: !!education });
  return education;
}

export async function getCandidateWorkExperience(userId) {
  const rows = await runQuery(`SELECT work_experience FROM candidate_profiles WHERE user_id = $1`, [userId]);
  const work = rows[0] ? rows[0].work_experience : null;
  console.log('[candidateDb] getCandidateWorkExperience:', { userId, workSummary: work ? (Array.isArray(work) ? `${work.length} entries` : 'object') : null });
  return work;
}

export async function getCandidateResumeUrl(userId) {
  if (!userId) {
    throw new Error(
      `[candidateDb] getCandidateResumeUrl called with invalid userId: ${userId}`
    );
  }

  const rows = await runQuery(
    `SELECT user_id, resume_url 
     FROM candidate_profiles 
     WHERE user_id = $1`,
    [userId]
  );

  if (!rows.length) {
    throw new Error(
      `[candidateDb] No candidate_profile found for user_id=${userId}`
    );
  }

  const { resume_url } = rows[0];

  if (!resume_url) {
    throw new Error(
      `[candidateDb] resume_url is NULL for user_id=${userId}`
    );
  }

  console.log('[candidateDb] getCandidateResumeUrl:', {
    userId,
    resume_url
  });

  return resume_url;
}


export async function getCandidateCoverVideo(userId) {
  const rows = await runQuery(`SELECT cover_video FROM candidate_profiles WHERE user_id = $1`, [userId]);
  const coverVideo = rows[0] ? rows[0].cover_video : null;
  console.log('[candidateDb] getCandidateCoverVideo:', { userId, coverVideo });
  return coverVideo;
}
