import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import Apis from './Apis';
import SwaggerHubIntegratorApi from './SwaggerHubIntegratorApi';

dotenv.config();
mongoose.Promise = global.Promise;

const app = express();
const router = express.Router();

const baseDirectory = 'tmp';
const mongoDbUri = process.env.MONGODB_URI;
const swaggerHubApiHost = process.env.SWAGGER_HUB_API_HOST;

mongoose
  .connect(mongoDbUri, {useMongoClient: true})
  .then(db => {
    const apis = new Apis(db);

    router.use('/api', new SwaggerHubIntegratorApi(apis, baseDirectory, swaggerHubApiHost).router);

    app.use ('/', router);
    app.use((error, request, response) => {
      response.status(error.status);
      response.json({message: error.message})
    })

    app.listen(process.env.PORT || 5000);
  });
