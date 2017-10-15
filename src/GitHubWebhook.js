import express from 'express';
import createError from 'http-errors';
import { EventEmitter } from 'events';

export const INVALID_SIGNATURE = 'GitHubWebhook.INVALID_SIGNATURE';
export const INVALID_EVENT = 'GitHubWebhook.INVALID_EVENT';
export const INVALID_REPOSITORY = 'GitHubWebhook.INVALID_REPOSITORY';
export const INVALID_REF = 'GitHubWebhook.INVALID_REF';
export const VALID_WEBHOOK = 'GitHubWebhook.VALID_WEBHOOK';

export default class GitHubWebhook extends EventEmitter
{
  constructor (validator) {
    super();

    this.validator = validator;
  }

  verifySignature () {
    return (request, response, next) => {
      if (this.validator.isSignatureValid(request.headers['x-hub-signature'], JSON.stringify(request.body))) {
        next();
      } else {
        this.sendError(next, 'Invalid signature', INVALID_SIGNATURE);
      }
    }
  }

  verifyPushEvent () {
    return (request, response, next) => {
      if (this.validator.isEventValid(request.headers['x-github-event'])) {
        next();
      } else {
        this.sendError(next, 'Invalid event type', INVALID_EVENT);
      }
    }
  }

  verifySshUrl() {
    return (request, response, next) => {
      if (this.validator.isRepositoryValid(request.body.repository.ssh_url)) {
        next();
      } else {
        this.sendError(next, 'Invalid repository', INVALID_REPOSITORY);
      }
    }
  }

  verifyRef() {
    return (request, response, next) => {
      if (this.validator.isRefValid(request.body.ref)) {
        next();
      } else {
        this.sendError(next, 'Invalid ref', INVALID_REF);
      }
    }
  }

  sendError (next, message, event) {
    this.emit(event);
    next(createError(400, new Error(message)));
  }

  get router ()
  {
    return express.Router()
      .post('/',
        express.json(),
        this.verifySignature(),
        this.verifyPushEvent(),
        this.verifySshUrl(),
        this.verifyRef(),
        this.request.bind(this));
  }

  request (request, response) {
    this.emit(VALID_WEBHOOK, request.body);
    response.status(200).send();
  }
}