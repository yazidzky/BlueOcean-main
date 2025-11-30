import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? "https://blue-ocean-main.vercel.app" : "http://localhost:5000");

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
