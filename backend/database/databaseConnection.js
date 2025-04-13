import path from "path";
import MongooseDatabase from "./mongoDatabase.js";
import { config } from 'dotenv';

config({path: path.resolve('config/.dev.env')});
const database = new MongooseDatabase(process.env.DB_URI);
database.connect();

export default database;