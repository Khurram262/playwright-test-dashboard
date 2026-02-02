# Jenkins Integration Guide

This guide details how to integrate the Playwright Test Dashboard with Jenkins for automated testing and reporting.

## 📋 Prerequisites

- **Jenkins 2.300+**
- **Node.js 18+** installed on Jenkins agents
- **Plugins**:
  - [NodeJS Plugin](https://plugins.jenkins.io/nodejs/)
  - [Pipeline Plugin](https://plugins.jenkins.io/workflow-aggregator/)
  - [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/) (for viewing reports)
  - [AnsiColor Plugin](https://plugins.jenkins.io/ansicolor/) (optional, for colored logs)

---

## 🚀 Quick Setup

### 1. Configure Node.js in Jenkins

1. Go to **Manage Jenkins** > **Global Tool Configuration**
2. Scroll to **NodeJS**
3. Click **Add NodeJS**
   - Name: `node-18`
   - Version: `NodeJS 18.x`
4. Save

### 2. Add API Key Credential (Optional)

If using AI analysis:
1. Go to **Manage Jenkins** > **Credentials**
2. Add a **Secret text** credential
   - ID: `google-genai-api-key`
   - Secret: *Your Gemini API Key*

### 3. Create a Pipeline Job

1. New Item > **Pipeline** > Name: `playwright-dashboard-tests`
2. Scroll to **Pipeline** section
3. Copy and paste the script below or point to your `Jenkinsfile`

---

## 📄 Jenkinsfile Configuration

Copy this content into a file named `Jenkinsfile` in your project root, or paste directly into the Jenkins Pipeline script area.

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'node-18' 
    }
    
    environment {
        // Dashboard Configuration
        DASHBOARD_API_URL = "http://YOUR_DASHBOARD_IP:3001/api" 
        
        // AI Analysis (Optional)
        GOOGLE_GENAI_API_KEY = credentials('google-genai-api-key')
    }
    
    stages {
        stage('📥 Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('📦 Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('🎭 Run Tests') {
            steps {
                // Run tests and generate JSON report
                sh 'npx playwright test --reporter=json,html --output=test-results > playwright-report.json || true'
            }
        }
        
        stage('🤖 AI Analysis') {
            when {
                expression {
                    // Only run if there are failures
                    def report = readJSON file: 'playwright-report.json' 
                    return report.stats.failed > 0
                }
            }
            steps {
                script {
                    echo "Failures detected. Running AI Analysis..."
                    sh """
                        curl -X POST ${DASHBOARD_API_URL}/analyze-failures \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${GOOGLE_GENAI_API_KEY}" \
                        -d @playwright-report.json \
                        -o ai-analysis.json
                    """
                }
            }
        }
        
        stage('📊 Upload to Dashboard') {
            steps {
                script {
                    echo "Uploading report to Dashboard..."
                    // Upload report to the dashboard backend
                    sh """
                        curl -X POST ${DASHBOARD_API_URL}/upload-report \
                        -H "Content-Type: application/json" \
                        -d @playwright-report.json
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Archive Results
            archiveArtifacts artifacts: 'playwright-report.json, ai-analysis.json', allowEmptyArchive: true
            
            // Publish HTML Report in Jenkins
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report',
                reportTitles: 'Playwright Test Results'
            ])
        }
    }
}
```

---

## 🔌 Connecting to Dashboard

To ensure your Jenkins build sends data to your dashboard:

1. **Dashboard URL**: Update `DASHBOARD_API_URL` in the Jenkinsfile to point to your deployed dashboard backend (e.g., `http://192.168.1.100:3001/api`).
2. **Network Access**: Ensure the Jenkins agent can reach the Dashboard server IP.


### POST /api/upload-report endpoint

Ensure your backend (`server/server.js`) has the upload endpoint enabled. If you are using the default setup, it should accept JSON posts:

```javascript
// Example implementation in server.js
app.post('/api/upload-report', (req, res) => {
    const reportData = req.body;
    // Save report logic...
    console.log('Received report from Jenkins');
    res.json({ success: true });
});
```

---

## 🛠️ Troubleshooting

- **`npx: command not found`**: Ensure the NodeJS plugin is installed and the `tools { nodejs 'node-18' }` block matches the name in Global Tool Configuration.
- **Connection Refused**: Check firewall settings between Jenkins and the Dashboard server.
- **AI Analysis 403/401**: Verify the `GOOGLE_GENAI_API_KEY` credential in Jenkins matches your active API key.
