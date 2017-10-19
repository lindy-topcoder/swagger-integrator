import express from 'express';
import uuid from 'uuid';

import GitHubWebhook, { VALID_WEBHOOK } from './GitHubWebhook';
import GitHubWebhookValidator from './GitHubWebHookValidator';
import SwaggerHubIntegratorJob from './SwaggerHubIntegratorJob';
import SwaggerCombiner from './SwaggerCombiner';
import SwaggerHubClient from "./SwaggerHubClient";

export default class SwaggerHubIntegratorApi {
  constructor (apis, baseDirectory, swaggerHubApiHost) {
    this.apis = apis;
    this.baseDirectory = baseDirectory;
    this.swaggerHubApiHost = swaggerHubApiHost;
  }

  runJob (api) {
    const swaggerHubClient = new SwaggerHubClient(this.swaggerHubApiHost, api.destination.apiKey);
    const combiner = new SwaggerCombiner(api.name, '1.0.0');
    const job = new SwaggerHubIntegratorJob(uuid.v1(), this.baseDirectory, api.repositories,
      combiner, swaggerHubClient, api.destination.owner, api.destination.api);

    job.run();
  }

  job (request, response) {
    this.apis
      .findById(request.params.id)
      .then(api => {
        if (api) {
          this.runJob(api);
          response.status(200).send();
        } else {
          response.status(404).send();
        }
      })
      .catch(e => {
        response.status(500).send(e);
      })
  }

  get router ()
  {
    const githubWebhookValidator = new GitHubWebhookValidator(this.apis, ['push']);
    const gitHubWebhook = new GitHubWebhook(githubWebhookValidator);

    gitHubWebhook.on(VALID_WEBHOOK, (data) => {
      this.apis
        .findByRepositorySshUrl(data.repository.ssh_url)
        .then(results => results.forEach(result => this.runJob(result)))
    })

    return express.Router()
      .use('/webhooks/github', gitHubWebhook.router)
      .post('/apis/:id/jobs', this.job.bind(this));
  }
}