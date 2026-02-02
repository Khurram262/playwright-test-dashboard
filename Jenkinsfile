pipeline {
    agent any
    
    // Removing 'tools' block to use system Node.js
    
    environment {
        DASHBOARD_API_URL = "http://localhost:3001/api"
        GOOGLE_GENAI_API_KEY = credentials('google-genai-api-key')
        // Add PATH to ensure npm is found (Windows specific)
        PATH = "C:\\Program Files\\nodejs;${PATH}"
    }
    
    stages {
        stage('📥 Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('📦 Install Dependencies') {
            steps {
                // Using 'bat' for Windows compatibility if 'sh' fails
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                        sh 'npx playwright install --with-deps'
                    } else {
                        bat 'npm ci'
                        bat 'npx playwright install --with-deps'
                    }
                }
            }
        }
        
        stage('🎭 Run Tests') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npx playwright test --reporter=json,html --output=test-results > playwright-report.json || true'
                    } else {
                        // Batch command for Windows
                        bat 'npx playwright test --reporter=json,html --output=test-results > playwright-report.json || ver > nul'
                    }
                }
            }
        }
        
        stage('📊 Upload to Dashboard') {
            steps {
                script {
                    echo "Uploading report to Dashboard..."
                    if (isUnix()) {
                        sh """
                            curl -X POST ${DASHBOARD_API_URL}/upload-report \
                            -H "Content-Type: application/json" \
                            -d @playwright-report.json
                        """
                    } else {
                        // Windows curl
                        bat """
                            curl -X POST %DASHBOARD_API_URL%/upload-report -H "Content-Type: application/json" -d @playwright-report.json
                        """
                    }
                }
            }
        }
    }
}