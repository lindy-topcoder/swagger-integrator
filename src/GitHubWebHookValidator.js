import { createHmac } from 'crypto';

export default class GitHubWebHookValidator
{
  constructor (apis, eventTypes) {
    this.apis = apis;
    this.eventTypes = eventTypes;
  }

  isEventValid (event) {
    return this.eventTypes.some(e => e === event);
  }

  isSignatureValid (signature, webhook) {
    return new Promise((resolve) => {
      if (webhook && webhook.repository) {
        this.apis
          .findByRepositorySshUrl(webhook.repository.ssh_url)
          .then(results => {
            if (results.length === 0) {
              resolve(false);
            } else {
              results
                .reduce((accumulator, result) => {
                  return accumulator.concat(result.repositories.filter(repository => repository.sshUrl === webhook.repository.ssh_url));
                }, [])
                .forEach(repo => {
                  const hmac = createHmac('sha1', repo.webhookSecret)
                    .update(JSON.stringify(webhook))
                    .digest('hex');

                  if (signature === `sha1=${hmac}`) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                })
            }
          })
      } else {
        resolve(false);
      }
    })
  }

  isRepositoryValid (webhook) {
    return new Promise((resolve) => {
      if (webhook && webhook.repository) {
        this.apis
          .findByRepositorySshUrl(webhook.repository.ssh_url)
          .then(results => resolve(results.length > 0));
      } else {
        resolve(false);
      }
    });
  }

  isRefValid (webhook) {
    return new Promise((resolve) => {
      if (webhook && webhook.repository) {
        this.apis
          .findByRepositorySshUrl(webhook.repository.ssh_url)
          .then(results => {
            resolve(results
              .reduce((accumulator, result) => accumulator.concat(result.repositories
                .filter(repository => repository.sshUrl === webhook.repository.ssh_url)), [])
              .some(repo => `refs/heads/${repo.branch}` === webhook.ref))
          });
      } else {
        resolve(false);
      }
    });
  }
}