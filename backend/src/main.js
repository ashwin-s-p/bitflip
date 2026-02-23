require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const equipmentRoutes = require("./routes/equipment.routes");

const connectDB = require("./config/db");
require("./config/influx"); // initialize influx

const { initMQTT } = require("./services/mqttSubscriber");

// Routes
const sensorRoutes = require("./routes/sensors.routes");
const predictionRoutes = require("./routes/prediction.routes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/equipment", equipmentRoutes);


// WebSocket
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

global.io = io;

// CONNECT DATABASES
connectDB(); // MongoDB

// ROUTES
app.use("/api/equipment", equipmentRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/predict", predictionRoutes);

// Health
app.get("/", (req, res) => {
  res.send("🚀 CNC AI Monitoring Backend Running");
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("🟢 Frontend connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Frontend disconnected:", socket.id);
  });
});

/*setInterval(() => {
  console.log("Sending test socket data");
  io.emit("mqttData", {
    machineId: "TEST",
    temperature: "99.99",
    vibration: ,
    spindleSpeed: ,
    timestamp: new Date().toISOString(),
  });
}, 3000); */

// MQTT INIT
if (process.env.MQTT_ENABLED === "true") {
  initMQTT();
  console.log("📡 MQTT Enabled");
} else {
  console.log("⚡ MQTT Disabled (Safe Mode)");
}

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});

