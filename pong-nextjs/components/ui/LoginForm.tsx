"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import apiUrl from "../../api-config";

export default function LoginForm() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      try {
        // Richiesta al backend per il login
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("nickname", nickname); // Salva il nickname
          localStorage.setItem("playerId", data.playerId); // Salva l'ID del giocatore
          router.push("/main"); // Reindirizza alla pagina principale
        } else {
          const error = await response.json();
          alert(error.message); // Mostra un messaggio se il gioco è pieno
        }
      } catch (err) {
        console.error("Errore durante il login:", err);
        alert("Impossibile connettersi al server.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center h-screen bg-gray-200 p-4"
    >
      <div className="bg-white p-6 rounded shadow-md w-full max-w-[400px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Inserisci il tuo nickname</h1>
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Gioca
        </button>
      </div>
    </form>
  );
}
