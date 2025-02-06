"use client";

import { createContext, useContext, useEffect } from "react";
import socketService from "@/lib/socket";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};

export function SocketProvider({ children }) {
  useEffect(() => {
    // Connect to socket when component mounts
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
}
