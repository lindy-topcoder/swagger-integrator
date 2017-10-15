import { createHmac } from 'crypto';

export default class GitHubWebHookValidator
{
  constructor (secret, eventTypes, repositories) {
    this.secret = secret;
    this.eventTypes = eventTypes;
    this.repositories = repositories;
  }

  isValid (event, signature, payload) {
    return this.isSignatureValid(signature, payload) &&
      this.isEventValid(event) &&
      this.isRepositoryValid(payload.repository.ssh_url) &&
      this.isRefValid(payload.ref);
  }

  isSignatureValid (signature, payload) {
    const hmac = createHmac('sha1', this.secret)
      .update(payload)
      .digest('hex');

    return signature === `sha1=${hmac}`;
  }

  isEventValid (event) {
    return this.eventTypes.some(e => e === event);
  }

  isRepositoryValid (sshUrl) {
    return this.repositories.some(repository => {
      return repository.sshUrl === sshUrl;
    })
  }

  isRefValid (ref) {
    return this.repositories.some(repository => {
      return `refs/heads/${repository.branch}` === ref;
    })
  }
}