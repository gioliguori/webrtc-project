"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiUrl from "../../api-config";
import WebcamStream from "../../components/ui/WebcamStream";
import PongGame from "../../components/ui/PongGame";

export default function MainPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>("");
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    const storedPlayerId = localStorage.getItem("playerId");

    if (!storedNickname || !storedPlayerId) {
      router.push("/"); // Torna al login se i dati sono mancanti
      return;
    }

    setNickname(storedNickname || ""); // Imposta il nickname
    setPlayerId(storedPlayerId ? parseInt(storedPlayerId) : null); // Converti playerId in numero o null
  }, [router]);

  // Funzione per gestire il logout
  const handleLogout = async () => {
    if (playerId !== null) {
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      });

      // Rimuovi i dati da localStorage
      localStorage.removeItem("nickname");
      localStorage.removeItem("playerId");

      // Torna al login
      router.push("/");
    }
  };

  useEffect(() => {
    // Aggiungi un listener per gestire la disconnessione dell'utente
    window.addEventListener("beforeunload", handleLogout);
    return () => {
      handleLogout();
      window.removeEventListener("beforeunload", handleLogout);
    };
  }, [handleLogout]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Benvenuto, {nickname}!</h1>
      <p>ID Giocatore: {playerId}</p>
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row justify-between items-center gap-4">
        <WebcamStream playerId={playerId === 1 ? "1" : "2"} />
        <PongGame />
        <WebcamStream playerId={playerId === 2 ? "1" : "2"} />
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Logout
      </button>
    </main>
  );
}
