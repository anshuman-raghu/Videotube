import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { DB_NAME } from '../constants.js'

const ConnectDB = async ()=> {
    try {
        const ConectionInstanse = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Mongodb Connected !!!  DB HOST: ${ConectionInstanse.connection.host}`);
    } catch (error) {
        console.error("Error ",error);
        process.exit(1)
    }
}

export default ConnectDB
