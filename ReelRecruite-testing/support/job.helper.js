import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getLatestJobId() {
  const jobPath = path.join(
    __dirname,
    '../fixtures/Recruiter/jobid.json'
  );

  if (!fs.existsSync(jobPath)) {
    throw new Error('Job ID file not found. Create a job first.');
  }

  const { jobId } = JSON.parse(fs.readFileSync(jobPath, 'utf-8'));
  return jobId;
}

export function buildJobUrl(jobId) {
  return `https://recruitai-web-production.up.railway.app/jobs/${jobId}`;
}

export function storeJobId(jobId) {
   const JOB_PATH = path.join(
    __dirname,
    '../fixtures/Recruiter/jobid.json'
  );
  if (!jobId) throw new Error('Cannot store empty jobId');

  const data = { jobId };
  fs.writeFileSync(JOB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Job ID stored successfully.', jobId );
}