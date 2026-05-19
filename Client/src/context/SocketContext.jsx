import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:8000"); // Backend URL
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("🟢 Connected to Socket.io server");
        });

        newSocket.on("disconnect", () => {
            console.log("🔴 Disconnected from Socket.io server");
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
