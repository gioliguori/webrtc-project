import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const socket = useSocket(); // Usa il socket dal contesto

    const createRoom = () => {
        if (socket) {
            socket.emit('createRoom'); // Chiede al server di creare una nuova stanza
            socket.on('roomCreated', (newRoomId: string) => {
                console.log(`Stanza creata con ID: ${newRoomId}`);
                navigate(`/room/${newRoomId}`);
            });
        }
    };

    return (
        <div>
            <h1>WebRTC Client</h1>
            <button onClick={createRoom}>Crea una stanza</button>
        </div>
    );
};

export default Home;
