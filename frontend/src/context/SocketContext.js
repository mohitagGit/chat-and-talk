import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();
var backend_url = "http://localhost:4000";
if (window.location.host === "varta-ls5r.onrender.com") {
  backend_url = "https://varta-ls5r.onrender.com";
}
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef();

  const initializeSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io.connect(backend_url, {
        auth: { token: currentUser.token },
        autoConnect: true,
      });
    }
    return socketRef.current;
  };

  useEffect(() => {
    if (currentUser) {
      const socket = initializeSocket();

      // initialise socket connection
      // socketRef.current = io.connect(backend_url, {
      //   auth: { token: currentUser.token },
      // });

      // listen for the socket connection
      socket.on("connect", () => {
        setSocketId(socketRef.current.id); // Store the new socket ID
        console.log("Connected with socket ID:", socketRef.current.id);
      });

      // Optional: Handle reconnection
      socket.on("reconnect", () => {
        setSocketId(socketRef.current.id);
        console.log("Socket reconnected with new ID:", socketRef.current.id);
      });

      // Optional: Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      // Close socket if component unmounts or when user logs out
      return () => {
        socket.disconnect();
      };
    }
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};
