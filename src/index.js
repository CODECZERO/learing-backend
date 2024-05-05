import app from "./app.js"
import { config } from 'dotenv';
import dbConnect from './db/dbConnect.js';
config();


dbConnect().then(()=>{app.get(process.env.PORT||4000,()=>{
    console.log("Runing");
})}).catch((error)=>{throw error})