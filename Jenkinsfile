pipeline {
    agent any
    
    tools {
        nodejs 'node-18' 
    }
    
    environment {
        // Dashboard Configuration
        DASHBOARD_API_URL = "http://localhost:3001/api" 
        
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