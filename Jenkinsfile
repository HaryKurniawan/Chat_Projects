pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Clean Workspace (Windows Fix)') {
            steps {
                // Menghapus folder node_modules jika terkunci oleh proses lain di Windows
                bat 'if exist node_modules rmdir /s /q node_modules'
                bat 'if exist backend\\node_modules rmdir /s /q backend\\node_modules'
                bat 'if exist frontend\\node_modules rmdir /s /q frontend\\node_modules'
                
                // Bersihkan cache npm 
                bat 'npm cache clean --force'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install --no-fund --no-audit'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install --no-fund --no-audit'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --format XML --format HTML', odcInstallation: 'Default'
                dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
        }
    }
}
