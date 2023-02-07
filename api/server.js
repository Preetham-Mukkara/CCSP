const {runUpdates} = require("./index")
const express = require("express");  
const fileUpload = require("express-fileupload")
const PORT = process.env.PORT || 5001;   
const server = express();
server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({limit: '50mb', extended: true }));
server.use(fileUpload())

server.get("/api/hello", (req, res) => {
    res.status(200).send("Hello World!");
   });

server.get("/api/update", (req,res)=>{
    const val = runUpdates()
    res.status(200).send(`Successfully added info, updated ${val} cells!`)
})


server.post("/api/file",async (req,res)=>{
    const response = await runUpdates(req.files.File.data)
    res.status(200).send(response)
})

server.listen(PORT, () => console.log(`listening on port ${PORT}`));