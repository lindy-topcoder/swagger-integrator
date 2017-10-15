export default [
  {
    id: 'v3',
    name: 'topcoder API v3',
    destination: {
      owner: 'lindy-topcoder',
      api: 'topcoder-api-v3',
    },
    repositories: [
      {
        sshUrl: 'git@github.com:appirio-tech/tc1-api-core.git',
        branch: 'dev', //no swagger in master
        path: 'tech.core/tech.core.service.identity/doc/swagger.yaml',
      },
      {
        sshUrl: 'git@github.com:appirio-tech/ap-challenge-microservice.git',
        branch: 'master',
        path: 'swagger.yaml',
      },
      {
        sshUrl: 'git@github.com:appirio-tech/tc-direct-project-service.git',
        branch: 'master',
        path: 'swagger.yaml',
      },
      {
        sshUrl: 'git@github.com:appirio-tech/ap-review-microservice.git',
        branch: 'master',
        path: 'swagger.yaml',
      },
      {
        sshUrl: 'git@github.com:appirio-tech/ap-submission-microservice.git',
        branch: 'master',
        path: 'service/swagger.yaml',
      },
      {
        sshUrl: 'git@github.com:appirio-tech/tc-tags-service.git',
        branch: 'master',
        path: 'swagger.yaml', //wrong path
      },
      {
        sshUrl: 'git@github.com:appirio-tech/ap-member-microservice.git',
        branch: 'master',
        path: 'swagger.yaml',
      },
      {
        sshUrl: 'git@github.com:appirio-tech/tc-preferences-service.git',
        branch: 'master',
        path: 'swagger.yaml',
      },

      {
        sshUrl: 'git@github.com:topcoder-platform/tc-billing-account-service.git',
        branch: 'master',
        path: 'swagger.yaml',
      },
      {
        sshUrl: 'git@github.com:appirio-tech/ap-file-microservice.git',
        branch: 'dev', // no swagger in master
        path: 'swagger.yaml',
      },
      // {
      //   url: 'git@github.com:appirio-tech/ap-member-cert-microservice.git',
      //   branch: 'master',
      //   path: 'service/src/main/java/com/appirio/service/membercert/resources', //no swagger
      // },
      // {
      //   url: 'git@github.com:appirio-tech/ap-notification-service.git', //no repo
      //   branch: 'master',
      //   path: 'src/main/java/com/appirio/notificationservice/resources',
      // },
      {
        sshUrl: 'git@github.com:appirio-tech/ap-alert-microservice.git',
        branch: 'dev', // no swagger in master
        path: 'swagger.json',
      },
      // {
      //   sshUrl: 'git@github.com:appirio-tech/ap-event-sample-service.git',
      //   branch: 'master',
      //   path: 'src/main/java/com/appirio/event/sample/resources' // no swagger
      // },
    ]
  }
];