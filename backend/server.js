import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/userRoute.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import storyRoutes from "./src/routes/storyRoute.js";
import User from "./src/models/user.js";
import Message from "./src/models/msgModel.js"; // ✅ Import Message model
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();
const frontendSite = "https://gram-snap.vercel.app" //https://gram-snap.vercel.app  http://localhost:3000
const app = express();
const server = http.createServer(app); // ✅ Create HTTP Server

// ✅ Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Configuration
app.use(
  cors({
    origin: frontendSite, // ✅ Correct frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "Content-Range"],
  })
);
app.options("*", cors());

// ✅ Routes
app.use("/", userRoutes);


const io = new Server(server, {
  cors: {
    origin: frontendSite, // ✅ Fixed typo
    methods: ["GET", "POST"],
    credentials: true
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 New Connection: ${socket.id}`);

  socket.on("userConnected", async (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`🔄 Marking user ${userId} as online in DB...`);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { online: true },
      { new: true }
    );

    if (!updatedUser) {
      console.log(`❌ User ${userId} not found in DB!`);
      return;
    }

    console.log(`✅ User ${updatedUser.userId} is now online in DB.`);

    await Message.updateMany(
      { receiverId: updatedUser.userId, status: "sent" },
      { $set: { status: "delivered" } }
    );

    io.to(userId).emit("messagesDelivered");
    io.emit("userOnline", { userId: updatedUser.userId }); // ✅ Fix property name
  });

  socket.on("disconnect", async () => {
    const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];

    if (userId) {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });

      console.log(`❌ User ${userId} went offline`);
      const offlineUser = await User.findById(userId);

      if (offlineUser) {
        io.emit("userOffline", { userId: offlineUser.userId, lastSeen: new Date() });
      }
    }
  });



  socket.on("join", async (userId) => {
    socket.join(userId);
    const users = await User.findById(userId);
    console.log("User Id is:" + users.userId);
    // ✅ Mark all messages as "delivered" when user comes online
    await Message.updateMany(
      { receiverId: users.userId, status: "sent" },
      { $set: { status: "delivered" } }
    );

    io.to(userId).emit("messagesDelivered");
  });

  socket.on("sendMessage", async (message) => {
    const newMessage = new Message({
      id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      message: message.message,
      status: "sent",
      createdAt: message.createdAt
    });
    //await newMessage.save();
    const receiver = await User.findOne({ userId: message.receiverId });
    if (!receiver) {
      console.log("Receiver not found");
      return;
    }
    let id = receiver._id.toString();
    // id.to_string();
    // ✅ Notify receiver in real-time
    console.log("User Msg to", id);
    console.log(onlineUsers);
    const socketId = onlineUsers.get(id); // ✅ Correct way for Map
    console.log("Socket ID:", socketId);
    io.to(socketId).emit("receiveMessage", newMessage);
  });
});
// socket.on("markMessageSee", async (message) =>{

// });

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/chat", chatRoutes);
app.use("/story", storyRoutes);

// ✅ Start Server Properly
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`)); // ✅ Use `server.listen()`
