const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {app, server} = require('./src/lib/socket.js');
dotenv.config();
const PORT = process.env.PORT;
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true, limit: "50mb"}));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.get('/', (req, res) => {
  res.send('Here.... from the App Backend from Satya...');
});
server.listen(PORT, () => {
  console.log(`Backend server listening on ${PORT} port...`);
});