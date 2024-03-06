 
const express = require('express')
const cors = require('cors');
require('./firebase/config')
const app = express();
const port = 5000;
app.use(cors());
require("dotenv").config();
// for using req.body  required middleware 
app.use(express.json())

//Availabe Routes
 
app.use('/api/auth',require("./Routes/auth"))
 

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})

 