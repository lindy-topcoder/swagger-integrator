# Swagger Integrator

Combines multiple swagger documents from multiple git repositories and saves the result to SwaggerHub.

## API

### Webhook

API endpoint that accepts a GitHub webhook at `/api/webhooks/github`

When a webhook is received it:
1. Must be a push event as defined by the header `X-GitHub-Event:push`
1. Must match the ssh url of a repository in the data
1. Must match the signature in the header `X-Hub-Signature` as signed by the secret defined in the data
1. Must match the ref as defined in the data

If all of these conditions pass a job is started. Multiple jobs may be started if one repository is defined in multiple APIs.

### Job

A job can be triggered manually by `POST /api/apis/:id/jobs` where `:id` is the id of the API in the data.

## Data

Data is stored in mongodb in the `apis` collection. An API is defined as:

```json
{
    "id": "my-api",
    "name": "My API",
    "destination": {
        "owner": "my-swagger-hub-owner",
        "api": "my-swagger-hub-api",
        "apiKey": "my-swagger-hub-api-key"
    },
    "repositories": [
        {
            "sshUrl": "git@github.com:my-group/my-repo.git",
            "branch": "my-branch-name",
            "path": "path/to/swagger.json",
            "enabled": true,
            "privateKey": "my-private-key",
            "publicKey": "my-public-key",
            "webhookSecret": "my-secret"
        }
    ]
}
```

`id` - Used by the Job API to look up a definition for manual triggering  
`name` - The name that is used in the parent swagger document  
`destination.owner` - The SwaggerHub owner user name  
`destination.api` - The SwaggerHub API name  
`desintation.apiKey` - The SwaggerHub secret used for making calls to the SwaggerHub API  
`repositories.sshUrl` - The GitHub SSH URL of the repository  
`repositories.branch` - The branch that should be checked out  
`repositories.path` - The path where the swagger doc is location relative to the root of the repository  
`repositories.enabled` - Boolean value, if false the swagger document will not be included in the output  
`repositories.privateKey` - The private key of the deploy key setup in the GitHub repository  
`repositories.publicKey` - The deploy key setup in the GitHub repository  
`repositories.webhookSecret` - The webhook secret setup in the GitHub repository  

## Flow

Once a valid webhook is received or a job is triggered manually the application:
1. Creates temporary directory for git repositories
1. Clones all enabled repositories
1. Checks out the defined branch
1. Filters out any repositories that were not cloned or checked out properly
1. Filters out any swagger documents that don't exist
1. Combines all remaining swagger documents
1. Saves resulting swagger document to SwaggerHub
1. Removes temporary directory

## Environment Variables

SWAGGER_HUB_API_HOST - API endpoint for SwaggerHub
MONGODB_URI - URI for mongodb connection

## Running Locally

1. Create `.env` file in root of repository with the above environment variables
1. run `npm run review`

## Running in Production

1. Define environment variables
1. run `npm start`