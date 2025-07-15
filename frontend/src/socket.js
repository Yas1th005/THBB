import { io } from "socket.io-client";

// Connect to the Socket.IO server
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

// Event listeners
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

socket.on("connect_error", (error) => {
  console.error("Socket.IO connection error:", error);
});

export default socket;
