import express from 'express';
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

  verifyEvent () {
    return (request, response, next) => {
      if (this.validator.isEventValid(request.headers['x-github-event'])) {
        next();
      } else {
        this.sendError(response, 'Invalid event type', INVALID_EVENT);
      }
    }
  }

  verifySshUrl() {
    return (request, response, next) => {
      if (request.body && request.body.repository) {
        this.validator
          .isRepositoryValid(request.body)
          .then(isValid => {
            if (isValid) {
              next();
            } else {
              this.sendError(response, 'Invalid repository', INVALID_REPOSITORY);
            }
          })
      } else {
        this.sendError(response, 'Invalid repository', INVALID_REPOSITORY);
      }
    }
  }

  verifySignature () {
    return (request, response, next) => {
      this.validator
        .isSignatureValid(request.headers['x-hub-signature'], request.body)
        .then(isValid => {
          if (isValid) {
            next();
          } else {
            this.sendError(response, 'Invalid signature', INVALID_SIGNATURE);
          }
        })
    }
  }

  verifyRef() {
    return (request, response, next) => {
      this.validator
        .isRefValid(request.body)
        .then(isValid => {
          if (isValid) {
            next();
          } else {
            this.sendError(response, 'Invalid ref', INVALID_REF);
          }
        })
    }
  }

  sendError (response, message, event) {
    this.emit(event);
    response.status(400).json({message: message})
  }

  get router ()
  {
    return express.Router()
      .post('/',
        express.json(),
        this.verifyEvent(),
        this.verifySshUrl(),
        this.verifySignature(),
        this.verifyRef(),
        this.request.bind(this));
  }

  request (request, response) {
    this.emit(VALID_WEBHOOK, request.body);
    response.status(200).send();
  }
}