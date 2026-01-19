// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return null;

  const socketUrl = import.meta.env.VITE_SOCKET_URL;

  // If socket exists and is connected, reuse it
  if (socket && socket.connected) return socket;

  // Create new socket if it doesn't exist or is disconnected
  socket = io(socketUrl, {
    auth: { token },
  });

  return socket;
};

export const getSocket = () => socket;
