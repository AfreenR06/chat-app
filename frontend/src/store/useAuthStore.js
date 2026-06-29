import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ✅ AUTH CHECK
  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });

      // connect socket only if user exists
      if (res.data?._id) {
        get().connectSocket(res.data);
      }
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ SOCKET CONNECT
  connectSocket: (user) => {
    if (!user?._id) return;

    const existingSocket = get().socket;

    // prevent duplicate connections
    if (existingSocket?.connected) return;

    // if socket exists but disconnected, clean it
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(BASE_URL, {
  query: {
    userId: user._id,
  },
  withCredentials: true,
  transports: ["websocket"],
});

    set({ socket });

    // online users update
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // optional debug
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });
  },

  // ✅ SOCKET DISCONNECT
  disconnectSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.disconnect();
    }

    set({ socket: null, onlineUsers: [] });
  },

  // ✅ LOGOUT / CLEAR AUTH
  clearAuth: () => {
    set({
      authUser: null,
      isCheckingAuth: false,
      onlineUsers: [],
    });

    get().disconnectSocket();
  },
}));