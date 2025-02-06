import { io } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected");
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.on(event, callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit an event
  emit(event, data) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.emit(event, data);
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
