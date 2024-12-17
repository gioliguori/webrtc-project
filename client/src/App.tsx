import React, { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://192.168.1.58:3001", {
  transports: ["websocket"],
});

const App: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    // Unisciti alla stanza unica
    console.log('Invio join al server');
    socket.emit("join");

    socket.on("joined", async () => {
      console.log("✅ Stanza unica. Inizio WebRTC come iniziatore.");
      await startWebRTC(true);
    });

    socket.on("full", () => {
      console.error("❌ Stanza piena!");
    });

    socket.on("other-joined", async () => {
      console.log("🚪 Un altro peer si è unito. Inizio WebRTC come ricevitore.");
      await startWebRTC(false);
    });

    socket.on("message", async (message) => {
      console.log("📨 Messaggio ricevuto:", message.type);

      if (!peerConnection.current) return;

      if (message.type === "offer") {
        console.log("📥 Offerta SDP ricevuta");
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(message.sdp)
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("message", { type: "answer", sdp: answer, room: "test-room" });
      } else if (message.type === "answer") {
        console.log("📥 Risposta SDP ricevuta");
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(message.sdp)
        );
      } else if (message.type === "candidate") {
        console.log("❄️ Candidato ICE ricevuto:", message.candidate);
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(message.candidate)
        );
      }
    });

    async function startWebRTC(isInitiator: boolean) {
      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("📤 Candidato ICE inviato:", event.candidate);
          socket.emit("message", { type: "candidate", candidate: event.candidate, room: "test-room" });
        }
      };

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          console.log("✅ Stream remoto assegnato al video remoto");
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("🎥 Stream locale avviato");
      }
      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      if (isInitiator) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        console.log("📤 Offerta SDP inviata:", offer);
        socket.emit("message", { type: "offer", sdp: offer, room: "test-room" });
      }
    }
  }, []);

  return (
    <div>
      <h1>WebRTC Client</h1>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "45%", marginRight: "10px", border: "1px solid black" }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "45%", border: "1px solid black" }}
      />
    </div>
  );
};

export default App;
