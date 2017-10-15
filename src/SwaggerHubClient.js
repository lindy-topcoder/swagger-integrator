import request from 'request';
import Logger from './Logger';

const logger = Logger('SwaggerHubClient');

export default class SwaggerHubClient
{
  constructor (host, apiKey) {
    this.host = host;
    this.apiKey = apiKey;
  }

  save (owner, api, document) {
    logger.info('saving', {host: this.host, owner: owner, api: api});
    return new Promise((resolve, reject) => {
      request({
        url: `${this.host}/apis/${owner}/${api}`,
        method: 'POST',
        headers: {
          Authorization: this.apiKey,
        },
        body: document,
        json: true,
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          if (response.statusCode === 200) {
            logger.info('updated', {host: this.host, owner: owner, api: api});
            resolve(response);
          } else if (response.statusCode === 201) {
            logger.info('created', {host: this.host, owner: owner, api: api});
            resolve(response);
          } else {
            logger.info('error', {host: this.host, owner: owner, api: api, statusCode: response.statusCode});
            reject(response);
          }
        }
      })
    })
  }
}