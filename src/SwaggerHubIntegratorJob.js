import PromisePool from 'es6-promise-pool';
import rimraf from 'rimraf';
import * as fs from 'fs';

import Logger from './Logger';
import GitRepository from './GitRepository';

const logger = Logger('SwaggerHubIntegratorJob');

export default class SwaggerHubIntegratorJob
{
  constructor (id, basePath, publicKey, privateKey, swaggerDocuments, combiner, swaggerHubClient, swaggerHubOwner, swaggerHubApi) {
    this.id = id;
    this.basePath = basePath;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.swaggerDocuments = swaggerDocuments;
    this.combiner = combiner;
    this.swaggerHubClient = swaggerHubClient;
    this.swaggerHubOwner = swaggerHubOwner;
    this.swaggerHubApi = swaggerHubApi;

    this.path = `${this.basePath}/${this.id}`;
  }

  run () {

    logger.info('starting', {id: this.id});

    this.cloneAll()
      .then(results => {
        const validResults = results.filter(result => !result.error);

        validResults.forEach(validResult => {
          validResult.repository.cleanup();
        })

        const validPaths = validResults
          .map(validResult => {
            return `${validResult.repository.path}/${validResult.swaggerDocument.path}`
          })
          .filter(path => {
            try {
              fs.accessSync(path)
              return true;
            } catch (e) {
              logger.info('no file found', {id: this.id, path: path});
              return false;
            }
          })

        logger.info(`using ${validPaths.length} of ${results.length} repositories`);
        return validPaths;
      })
      .then(validPaths => this.combiner.combine(validPaths))
      .then(swaggerDoc => this.swaggerHubClient.save(this.swaggerHubOwner, this.swaggerHubApi, swaggerDoc))
      .then(response => this.cleanup())
      .then(() => {
        logger.info('complete', {id: this.id});
      })
      .catch (e => {
        logger.info('error', {id: this.id, error: e});
        this.cleanup()
          .catch(e => {

          })
      })
  }

  cleanup () {
    logger.info('cleaning up', {id: this.id});

    return new Promise ((resolve, reject) => {
      rimraf(this.path, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  }

  cloneAll () {

    const docs = this.swaggerDocuments.slice();

    const pool = new PromisePool(() => {

      if (docs.length === 0) {
        return null;
      }

      const swaggerDocument = docs.pop();

      return new Promise((resolve) => {
        const repository = new GitRepository(swaggerDocument.sshUrl, swaggerDocument.branch, this.publicKey, this.privateKey);
        repository
          .clone(this.path)
          .then(() => {
            resolve({
              repository: repository,
              error: false,
            });
          })
          .catch(e => {
            resolve({
              repository: repository,
              error: e,
            });
          })
      })
        .then(result => {
          return {
            swaggerDocument: swaggerDocument,
            repository: result.repository,
            error: result.error
          }
        })
    }, 1);

    const results = [];

    pool.addEventListener('fulfilled', (e) => {
      results.push(e.data.result);
    })

    return pool.start()
      .then(() => {
        return results;
      });
  }
}