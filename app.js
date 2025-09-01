import express from "express";
import dotenv from "dotenv";
import routes from "./src/routes/index.js";

dotenv.config({ 
  path: ".env.development" 
});

const app = express();
app.use(express.json());

app.use(routes);

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
})