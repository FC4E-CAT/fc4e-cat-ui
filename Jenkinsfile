pipeline {
    agent none
    options {
        checkoutToSubdirectory('cat-ui')
        newContainerPerStage()
    }
    environment {
        PROJECT_DIR='cat-ui'
    }
    stages {
        stage ('Build and Deploy cat-ui') {
            agent {
                docker {
                    image 'node:lts-buster'
                }
            }
            steps {
                echo 'Build cat-ui'
                    sh '''
                        cd $WORKSPACE/$PROJECT_DIR
                        npm install
                        CI=false npm run prettier && npm run stylelint && npm run lint && npm run build
                    '''
            }
        }
    }
    post {
        success {
            script{
                if ( env.BRANCH_NAME == 'devel' ) {
                    slackSend( message: ":rocket: New version for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME !")
                    slackSend( message: ":satellite: New version of <$BUILD_URL|$PROJECT_DIR> built successfully to devel!")
                }
                else if ( env.BRANCH_NAME == 'main' ) {
                    slackSend( message: ":rocket: New version for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME !")
                }
            }
        }
        failure {
            script{
                if ( env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'devel' ) {
                    slackSend( message: ":rain_cloud: Build Failed for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME")
                }
            }
        }
    }
}