import express from "express";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use(express.json());
// app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server start at http://localhost:${process.env.PORT}`);
});