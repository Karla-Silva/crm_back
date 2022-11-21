const express = require("express");
const cors = require("cors");
const AuthRouter = require('./src/routes/routes.js');
const dotenv = require("dotenv");

dotenv.config();
const server = express();

server.use(cors());
server.use(express.json());
server.use(AuthRouter);

server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})