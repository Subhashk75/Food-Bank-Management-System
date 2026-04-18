const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/connection');
const userRoute = require("./routes/user")
const PORT = process.env.PORT 
const app = express();
const productRoute = require("./routes/product");
const transactionRoute = require("./routes/transaction")
const inventoryRoute = require("./routes/Inventory")
const categoriesRoute = require("./routes/category")
// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

const _dirname = path.resolve();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API Routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/transaction' , transactionRoute);
app.use('/api/v1/inventory' , inventoryRoute);
app.use('/api/v1/categories' ,categoriesRoute );

 
app.use(express.static(path.join(_dirname , "/client/build")));
app.get('*' , (req,res)=>{
   res.sendFile(path.resolve(_dirname , "client" , "build" , "index.html"));
})

// Database connection
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
}); 