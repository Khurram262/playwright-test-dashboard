import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Returns absolute path to the resume in fixtures
 * Throws error if file does not exist
 */
export function getResumePath(filename = 'Bold-Poster.pdf') {
  const resumePath = path.join(__dirname, '../fixtures', filename);

  if (!fs.existsSync(resumePath)) {
    throw new Error(`Resume file not found: ${resumePath}`);
  }

  return resumePath;
}

export function getVideoPath(filename = 'sample-video.mp4') {
  const videoPath = path.join(__dirname, '../fixtures', filename);

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }
  return videoPath;
}
