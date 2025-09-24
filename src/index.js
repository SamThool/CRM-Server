const express = require("express");
const fs = require("fs");
require("dotenv").config();
const cors = require("cors");
const connection = require("./config/config");
const routes = require("./routes");
const path = require("path");
const socketIO = require("socket.io");
const http = require("http");
const { initilizeSocket } = require("./utils/socket");
const app = express();

// ✅ Middleware he
// app.use(cors({ origin: "*", credentials: true, optionSuccessStatus: 200 }));
const allowedOrigins = [
  "http://localhost:3000",
  "https://mirai.isyncerp.com",
  "https://crm-client-phi.vercel.app",
];

app.use("/api/uploads", express.static("public/images"));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static Files & Routes
app.get("/", (req, res) => {
  res.send("✅ CRM Backend is running");
});

app.use("/api", routes);

const imagesPath = path.join(__dirname, "/public/images");
app.use("/api/images", express.static(imagesPath));

// ✅ Create server from Express
const server = http.createServer(app);
initilizeSocket(server);
// ✅ Start Server
server.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("✅ Connected to Mongo Atlas");
    console.log(`🚀 Server started on port ${process.env.port}`);
  } catch (err) {
    console.log("❌ MongoDB connection error:", err.message);
  }
});
