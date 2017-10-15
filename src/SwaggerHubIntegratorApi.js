import express from 'express';
import uuid from 'uuid';

import GitHubWebhook, { VALID_WEBHOOK } from './GitHubWebhook';
import GitHubWebhookValidator from './GitHubWebHookValidator';
import SwaggerHubIntegratorJob from './SwaggerHubIntegratorJob';
import SwaggerCombiner from './SwaggerCombiner';

export default class SwaggerHubIntegratorApi {
  constructor (apis, gitHubWebHookSecret, gitHubPublicKey, gitHubPrivateKey, baseDirectory, swaggerHubClient) {
    this.apis = apis;
    this.gitHubWebHookSecret = gitHubWebHookSecret;
    this.gitHubPublicKey = gitHubPublicKey;
    this.gitHubPrivateKey = gitHubPrivateKey;
    this.baseDirectory = baseDirectory;
    this.swaggerHubClient = swaggerHubClient;
  }

  runJob (api) {
    const combiner = new SwaggerCombiner(api.name, '1.0.0');
    const job = new SwaggerHubIntegratorJob(uuid.v1(), this.baseDirectory, this.gitHubPublicKey, this.gitHubPrivateKey,
      api.repositories, combiner, this.swaggerHubClient, api.destination.owner, api.destination.api);

    job.run();
  }

  get router ()
  {
    const allRepositories = this.apis.reduce((accumulator, api) => {
      return accumulator.concat(api.repositories)
    }, [])

    const githubWebhookValidator = new GitHubWebhookValidator(this.gitHubWebHookSecret, ['push'], allRepositories);
    const gitHubWebhook = new GitHubWebhook(githubWebhookValidator);

    gitHubWebhook.on(VALID_WEBHOOK, (data) => {
      this.apis
        .filter(api => api.repositories.some(repository => repository.sshUrl === data.repository.ssh_url))
        .forEach(api => {
          this.runJob(api);
        })
    })

    return express.Router()
      .use('/webhooks/github', gitHubWebhook.router)
      .post('/apis/:id/jobs', (request, response) => {
        const api = this.apis.find(api => api.id === request.params.id);
        if (api) {
          this.runJob(api);
          response.status(200).send();
        } else {
          response.status(404).send();
        }
      });
  }
}