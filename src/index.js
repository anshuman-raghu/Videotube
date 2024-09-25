import ConnectDB from './db/index.js'
import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

ConnectDB()
.then(()=>{
    app.on("Error",(error)=>{
        console.log("Error:",error)    
    })
    const port=process.env.port||8000;
    app.listen(port, ()=>{
        console.log(`Server is Running on http://localhost:${port}`);
    })
})
.catch((error)=>{
    console.error("Mongodb Connection failed ",error)
})


