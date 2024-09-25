import express from 'express'
import ConnectDB from './db/index.js'
import dotenv from 'dotenv'
dotenv.config()

ConnectDB()
const app =express()


