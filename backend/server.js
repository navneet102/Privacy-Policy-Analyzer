import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import apiRoutes from "../backend/routes/api.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }));
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Privacy Lens API is ready!');
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}