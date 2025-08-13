
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
    
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(" Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'whatsapp',
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"));

app.use('/api', chatRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
