import express from 'express';
import dotenv from 'dotenv';

import apis from './apis'
import SwaggerHubClient from './SwaggerHubClient';
import SwaggerHubIntegratorApi from './SwaggerHubIntegratorApi';

dotenv.config();

const app = express();
const router = express.Router();

const gitHubWebHookSecret = process.env.GIT_HUB_WEBHOOK_SECRET;
const gitHubPublicKey = process.env.GIT_HUB_PUBLIC_KEY;
const gitHubPrivateKey = process.env.GIT_HUB_PRIVATE_KEY;
const baseDirectory = 'tmp';
const swaggerHubApiHost = process.env.SWAGGER_HUB_API_HOST;
const swaggerHubApiSecret = process.env.SWAGGER_HUB_API_SECRET;

const swaggerHubClient = new SwaggerHubClient(swaggerHubApiHost, swaggerHubApiSecret);

router.use('/api', new SwaggerHubIntegratorApi(apis, gitHubWebHookSecret, gitHubPublicKey, gitHubPrivateKey, baseDirectory, swaggerHubClient).router);

app.use ('/', router);
app.use((error, request, response) => {
  response.status(error.status);
  response.json({message: error.message})
})

app.listen(process.env.PORT || 5000);