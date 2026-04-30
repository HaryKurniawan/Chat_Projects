pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    // Menggunakan 'npm ci' (Clean Install) jauh lebih cepat untuk CI/CD
                    // daripada 'npm install' + menghapus node_modules/cache secara manual.
                    bat 'npm ci --no-fund'
                }
            }
        }

        stage('ESLint Security Scan (Frontend)') {
            steps {
                dir('frontend') {
                    // Menangkap error agar pipeline tetap lanjut ke stage OWASP jika ada celah
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        bat 'npx eslint . --format html -o eslint-report.html'
                    }
                }
            }
            post {
                always {
                    // Menyimpan laporan sebagai artifact karena plugin HTML Publisher tidak tersedia
                    archiveArtifacts artifacts: 'frontend/eslint-report.html', allowEmptyArchive: true
                }
            }
        }


        stage('OWASP Dependency Check') {
            steps {
                // Catatan: Jika ini masih terlalu lama, Anda mungkin perlu memindahkannya ke pipeline terpisah (nightly build)
                dependencyCheck additionalArguments: '--scan ./frontend --format XML --format HTML', odcInstallation: 'Default'
                dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
            post {
                always {
                    // Menyimpan laporan sebagai artifact karena plugin HTML Publisher tidak tersedia
                    archiveArtifacts artifacts: 'dependency-check-report.html', allowEmptyArchive: true
                }
            }
        }
    }
}
