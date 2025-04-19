import express from 'express';
import { config } from 'dotenv';
import  path from "path";
import * as router from './src/modules/index.js';
import { ErrorHandlerClass, logger } from './src/utils/index.js';
import { globalResponse } from './src/middlewares/error-hanling.middleware.js';

if(process.env.NODE_ENV === 'dev'){
    config({path: path.resolve('config/.dev.env')});
    logger.info("dev env loaded")
}
else if(process.env.NODE_ENV === 'prod'){
    config({path: path.resolve("config/.prod.env")});
    logger.info("prod env loaded");
}
else{
    config({path: path.resolve("config/.env")});
    console.log("env loaded");
}
const app = express()
const port = process.env.PORT;



app.use(express.json());

app.use('/auth',router.authRouter);
app.use('/patient', router.patientRouter);
app.use('/medication', router.medicationRouter);



import { createClient } from 'redis';
import { startMissedDosesJob } from './src/modules/medication/utils/cron.utils.js';

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
await client.ping();
logger.info("Client Connected successfully to Redis");

await client.set('key', 'value');
const value = await client.get('key');

app.use('/*', (req, res,next) =>{
    return next(new ErrorHandlerClass(`Invalid URL : ${req.originalUrl}`,404,"Error in URL in index.js"))
})

app.use(globalResponse);

startMissedDosesJob();


app.get('/', (req, res) => res.send('server running!'))
app.listen(port, () => 
    logger.info(`app listening on port ${port}!`))
