import express from 'express';
import path from 'path';
import { resolve } from 'path';
import fs from 'fs';
import open from 'open';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';

let currentRunProcess = null; // Active process for the current test file
let isRunStopped = false;    // Flag to abort the remaining files in a full run

const app = express();
const PORT = 5000;

const dashboardPath = path.join(process.cwd(), 'dashboard');

// Direct path to Playwright Test CLI (bypasses npx and shell)
const playwrightCliPath = resolve(
  process.cwd(),
  'node_modules',
  '@playwright',
  'test',
  'cli.js'
);

app.use(express.json());

// API: Get runs
app.get('/api/runs', (req, res) => {
  const dataFile = path.join(process.cwd(), 'server', 'data', 'runs.json');

  if (!fs.existsSync(dataFile)) return res.json([]);

  try {
    const rawData = fs.readFileSync(dataFile, 'utf-8');
    const data = JSON.parse(rawData);
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Error loading runs:', err.message);
    res.status(500).json({ error: 'Failed to load runs' });
  }
});

// API: Re-run single test
app.post('/api/rerun-test', (req, res) => {
  const { file, title } = req.body;

  if (!file || !title) {
    return res.status(400).json({ error: 'Missing file or title' });
  }

  let safeFile = file.replace(/[^a-zA-Z0-9_./\-\\]/g, '');
  safeFile = safeFile.replace(/^D:[\\/]/i, '').replace(/\\/g, '/');

  const safeTitle = title.trim().replace(/"/g, '\\"');

  console.log(`\n🔄 Re-running single test`);
  console.log(`   Title: "${title}"`);
  console.log(`   File : ${safeFile}\n`);

  // Escape regex metacharacters so Playwright's --grep receives a literal match
  const escapedGrep = safeTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // For debugging, print the final grep string
  console.log('   Grep :', escapedGrep);

  const spawnArgs = [
    playwrightCliPath,
    'test',
    safeFile,
    '--grep',
    escapedGrep,
    '--retries=1',
    '--workers=1'
  ];

  console.log('Spawning:', 'node', spawnArgs.join(' '));

  const child = spawn('node', spawnArgs, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

    // expose single-run process so it can be stopped via /api/stop-run
    currentRunProcess = child;

  child.on('close', (code) => {
    // The rerun was executed successfully, regardless of test result
    // Wait for the reporter to write the results to runs.json
    // The reporter's onEnd() is called when the process closes, but file write is async
    setTimeout(() => {
      if (code === 0) {
        console.log('✅ Single test passed\n');
        res.json({ success: true, passed: true, code: 0 });
      } else {
        console.log(`❌ Single test failed (exit code ${code})`);
        console.log(`   Note: Rerun executed successfully. Test result saved to dashboard.\n`);
        // Still return success: true because the rerun executed successfully
        // The test result (pass/fail) is separate from execution success
        res.json({ success: true, passed: false, code });
      }
    }, 1000); // Increased delay to ensure reporter finishes writing
  });

  child.on('error', (err) => {
    console.error('Failed to start Playwright:', err.message);
    res.status(500).json({ error: 'Failed to start test' });
  });
});

// API: Run all tests in order
app.post('/api/run-all-tests', (req, res) => {
  if (currentRunProcess) {
    return res.status(409).json({ error: 'A full test run is already in progress' });
  }

  isRunStopped = false; // Reset stop flag

  const testFiles = [
    'UI/Signup.spec.js',
    'UI/Recruiter/ForgetPassword.spec.js',
    'UI/candidate/PhoneLogin.spec.js',
    'UI/candidate/ChangePassword.spec.js',
    'UI/Login.spec.js',
    'UI/Recruiter/UpdateInfo.spec.js',
    'UI/Recruiter/UpdateAbout.spec.js',
    'UI/Recruiter/UpdateCompany.spec.js',
    'UI/candidate/UpdateInfo.spec.js',
    'UI/candidate/UpdateAbout.spec.js',
    'UI/candidate/UpdateSkill.spec.js',
    'UI/candidate/UpdateWork.spec.js',
    'UI/candidate/UpdateEducation.spec.js',
    'UI/candidate/UpdateResume.spec.js',
    'UI/candidate/UpdateCoverVideo.spec.js',
    'UI/candidate/FIlter.spec.js',
    'UI/candidate/workTypeFilter.spec.js',
    'UI/candidate/regionFilter.spec.js',
    'UI/candidate/Notification.spec.js',
    'UI/candidate/jobtype.spec.js',
    'UI/candidate/experienceLevelFilter.spec.js',
    'UI/candidate/currencyFilter.spec.js',
    'UI/candidate/SearchJob.spec.js',
    'UI/Recruiter/SaveDraft.spec.js',
    'UI/Recruiter/CreateJob.spec.js',
    'UI/Recruiter/EditJob.spec.js',
    'UI/candidate/jobApply.spec.js',
    'UI/Recruiter/viewApplications.spec.js',
    'UI/Recruiter/ShortlistCandidate.spec.js',
    'UI/Recruiter/SeeResume.spec.js',
    'UI/Recruiter/SeeCoverVideo.spec.js',
    'UI/Recruiter/sendMessage.spec.js',
    'UI/Recruiter/ArchiveChat.spec.js',
    'UI/Recruiter/UnArchiveChat.spec.js',
    'UI/Candidate/withdrawApplication.spec.js',
    'UI/Recruiter/RejectCandidate.spec.js',
    'UI/candidate/ViewAppliedJobs.spec.js',
    'UI/Recruiter/DeleteJob.spec.js'
  ];

  console.log('\nStarting full test run in order...\n');

  let index = 0;

  const runNext = () => {
    if (isRunStopped) {
      currentRunProcess = null;
      console.log('\nFull test run stopped. Remaining files skipped.\n');
      return res.json({ success: true, message: 'Test run stopped' });
    }

    if (index >= testFiles.length) {
      currentRunProcess = null;
      console.log('\nAll tests completed.\n');
      return res.json({ success: true });
    }

    const file = testFiles[index];
    console.log(`Running (${index + 1}/${testFiles.length}): ${file}`);

    currentRunProcess = spawn('node', [
      playwrightCliPath,
      'test',
      file,
      '--workers=1'
    ], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    currentRunProcess.on('close', (code) => {
      currentRunProcess = null;
      if (code === 0) {
        console.log(`✅ ${file} passed\n`);
      } else {
        console.log(`❌ ${file} failed (code ${code})\n`);
      }
      index++;
      runNext();
    });

    currentRunProcess.on('error', (err) => {
      currentRunProcess = null;
      console.error(`Spawn error for ${file}:`, err.message);
      index++;
      runNext();
    });
  };

  runNext();
});

// API: Stop current full run
app.post('/api/stop-run', (req, res) => {
  if (!currentRunProcess) {
    return res.status(400).json({ error: 'No test run in progress' });
  }

  isRunStopped = true;

  console.log('\nStopping full Playwright test run...');

  try {
    currentRunProcess.kill('SIGINT');
    console.log('Sent SIGINT – current test file shutting down gracefully');
  } catch (e) {
    console.warn('Failed to send SIGINT:', e.message);
  }

    // Clear current process reference
    currentRunProcess = null;

  res.json({
    success: true,
    message: 'Full test run stopped – current file terminating, remaining files skipped'
  });
});

// Static files
app.use(express.static(dashboardPath));

// SPA fallback (Express 5 compatible)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(dashboardPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\nDashboard server running at http://localhost:${PORT}\n`);
  open(`http://localhost:${PORT}`);
});