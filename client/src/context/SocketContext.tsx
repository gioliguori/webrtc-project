import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// Crea un contesto per il socket
const SocketContext = createContext<Socket | null>(null);

// Fornisce la connessione del socket ai componenti figli
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connessione al server Socket.IO
        const socketInstance = io("https://192.168.1.58:3001", { transports: ['websocket'] });
        setSocket(socketInstance);

        // Cleanup quando il componente viene smontato
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

// Custom hook per ottenere la connessione socket
export const useSocket = () => {
    const context = useContext(SocketContext);
    return context;
};
