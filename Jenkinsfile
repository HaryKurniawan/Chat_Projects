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
                bat 'if exist frontend\\node_modules rmdir /s /q frontend\\node_modules'
                
                // Bersihkan cache npm 
                bat 'npm cache clean --force'

                bat 'if exist frontend\\dist rmdir /s /q frontend\\dist'
                bat 'npm install --frozen-lockfile'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install --no-fund'
                }
            }
        }

        stage('ESLint Security Scan') {
            steps {
                // Gunakan catchError agar pipeline lanjut ke stage berikutnya (OWASP) meskipun ada error linting
                // Sehingga kita bisa melihat semua kerentanan secara bersamaan di akhir pipeline
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        bat 'npx eslint . --format html -o eslint-report.html'
                    }
                }
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    dir('backend') {
                        bat 'npx eslint "src/**/*.{ts,js}" --format html -o eslint-report.html'
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'frontend',
                        reportFiles: 'eslint-report.html',
                        reportName: 'ESLint Frontend Security Report',
                        keepAll: true,
                        alwaysLinkToLastBuild: true,
                        allowMissing: true
                    ])
                    publishHTML([
                        reportDir: 'backend',
                        reportFiles: 'eslint-report.html',
                        reportName: 'ESLint Backend Security Report',
                        keepAll: true,
                        alwaysLinkToLastBuild: true,
                        allowMissing: true
                    ])
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

        // stage('OWASP Dependency Check') {
        //     steps {
        //         dependencyCheck additionalArguments: '--scan ./frontend --format XML --format HTML', odcInstallation: 'Default'
        //         dependencyCheckPublisher pattern: 'dependency-check-report.xml'
        //     }
        // }

        stage('OWASP Dependency Check') {
    steps {
        dependencyCheck additionalArguments: '--scan ./frontend --format XML --format HTML', odcInstallation: 'Default'
        dependencyCheckPublisher pattern: 'dependency-check-report.xml'
    }
    post {
        always {
            publishHTML([
                reportDir: 'dependency-check-report',
                reportFiles: 'dependency-check-report.html',
                reportName: 'OWASP Dependency Check Report'
            ])
        }
    }
}
 
    }
}
