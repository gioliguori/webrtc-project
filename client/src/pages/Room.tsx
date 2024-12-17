import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext'; // Importa il custom hook per il socket

const Room: React.FC = () => {
    const { id: roomId } = useParams();
    const socket = useSocket(); // Usa il socket dal contesto
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    useEffect(() => {
        if (roomId && socket) {  // Aggiunto controllo per socket
            console.log('Unisciti alla stanza', roomId);
            socket.emit('join', roomId);

            socket.on('joined', async () => {
                console.log(`✅ Stanza ${roomId}. Inizio WebRTC come iniziatore.`);
                await startWebRTC(true);
            });

            socket.on('full', () => {
                console.error(`❌ Stanza ${roomId} piena!`);
            });

            socket.on('other-joined', async () => {
                console.log(`🚪 Un altro peer si è unito alla stanza ${roomId}. Inizio WebRTC come ricevitore.`);
                await startWebRTC(false);
            });

            socket.on('message', async (message: any) => {
                console.log('📨 Messaggio ricevuto:', message.type);

                if (!peerConnection) return;

                if (message.type === 'offer') {
                    console.log('📥 Offerta SDP ricevuta');
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    socket.emit('message', { type: 'answer', sdp: answer, room: roomId });
                } else if (message.type === 'answer') {
                    console.log('📥 Risposta SDP ricevuta');
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
                } else if (message.type === 'candidate') {
                    console.log('❄️ Candidato ICE ricevuto:', message.candidate);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
            });
        }
    }, [roomId, socket, peerConnection]);

    const startWebRTC = async (isInitiator: boolean) => {
        const pc = new RTCPeerConnection(configuration);
        setPeerConnection(pc);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('📤 Candidato ICE inviato:', event.candidate);
                if (socket) { // Verifica che socket non sia null
                    socket.emit('message', { type: 'candidate', candidate: event.candidate, room: roomId });
                }
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                console.log('✅ Stream remoto assegnato al video remoto');
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            console.log('🎥 Stream locale avviato');
        }

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log('📤 Offerta SDP inviata:', offer);
            if (socket) { // Verifica che socket non sia null
                socket.emit('message', { type: 'offer', sdp: offer, room: roomId });
            }
        }
    };

    return (
        <div>
            <h1>Stanza: {roomId}</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '45%', border: '1px solid black' }}
                />
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: '45%', border: '1px solid black' }}
                />
            </div>
        </div>
    );
};

export default Room;
