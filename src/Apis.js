import { Schema } from 'mongoose';

export default class Apis {
  constructor(db) {
    this.model = db.model('Api', new Schema({
      id: String,
      name: String,
      destination: new Schema({
        owner: String,
        api: String,
        apiKey: String,
      }),
      repositories: [new Schema({
        sshUrl: String,
        branch: String,
        path: String,
        enabled: Boolean,
        privateKey: String,
        publicKey: String,
        webhookSecret: String,
      })],
    }))
  }

  findById (id) {
    return this.model.findOne({id: id});
  }

  findByRepositorySshUrl (sshUrl) {
    return this.model.find({'repositories.sshUrl': sshUrl});
  }
}