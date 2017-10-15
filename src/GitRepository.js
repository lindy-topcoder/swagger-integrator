import {Clone, Cred, Repository} from 'nodegit';
import Logger from './Logger';

const logger = Logger('GitRepository');

import * as fs from 'fs';
import rimraf from 'rimraf';

export default class GitRepository
{
  constructor (sshUrl, branch, publicKey, privateKey) {
    this.sshUrl = sshUrl;
    this.branch = branch;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  clone (basePath) {
    this.path = `${basePath}/${new RegExp('\\S*@\\S*:(\\S*\\/\\S*).git').exec(this.sshUrl)[1]}`;
    logger.info('cloning started', {repository: this.sshUrl});
    return new Promise((resolve, reject) => {
      rimraf(this.path, () => {
        fs.mkdir(this.path, () => {
          Clone(this.sshUrl, this.path, {
            fetchOpts: {
              callbacks: {
                certificateCheck: () => {
                  return 1;
                },
                credentials: (url, userName) => {
                  return Cred.sshKeyMemoryNew(
                    userName,
                    this.publicKey,
                    this.privateKey,
                    '')
                }
              },
            },
          })
            .then((repo) => {
              logger.info('cloning completed', {repository: this.sshUrl});
              logger.info('checkout started', {repository: this.sshUrl, branch: this.branch});
              this.repo = repo;
              return repo
                .getBranch(`refs/remotes/origin/${this.branch}`)
                .then(branch => {
                  return repo.checkoutRef(branch)
                    .then(() => {
                      logger.info('checkout completed', {repository: this.sshUrl, branch: this.branch});
                      resolve();
                    })
                })
                .catch(e => {
                  logger.error('checkout error', {error: e.message, repository: this.sshUrl, branch: this.branch});
                  reject(e);
                })
            })
            .catch(e => {
              logger.error('cloning error', {error: e.message, repository: this.sshUrl, branch: this.branch});
              reject(e);
            })
        });
      })
    })
  }

  cleanup () {
    this.repo.cleanup();
  }

  getFile (path) {
    return this.repo
      .getHeadCommit()
      .then((commit) => {
        return commit.getEntry(path)
      })
  }
}