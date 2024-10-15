const express = require('express');
const app = express();
const database=require("./config/database");
const cookieParser = require("cookie-parser");
const fileUpload=require("express-fileupload")
const userRoutes = require("./routes/User");
const {cloudinaryConnect}=require("./config/cloudinary")
const storeRoutes=require("./routes/store");
const companyRoutes=require("./routes/Company");
const modelRoutes=require("./routes/Model");
require('dotenv').config();

const PORT = process.env.PORT || 3000;
app.use(express.json()); // Corrected middleware usage
app.use(cookieParser());
database.connect();


app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:"/tmp"
}))
cloudinaryConnect()
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/store",storeRoutes);
app.use("/api/v1/company",companyRoutes);
app.use("/api/v1/model",modelRoutes);
console.log("Hello, we are from the index page after");
app.get("/", (req, res) => {
  return res.json({
      success: true,
      message: "Your server is running....",
  });
});

app.listen(PORT, () => {
  console.log(`Your server is started on PORT ${PORT}`);
});