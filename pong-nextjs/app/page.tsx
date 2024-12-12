import PongGame from '../components/PongGame'
import WebcamStream from '../components/WebcamStream'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row justify-between items-center gap-4">
        <WebcamStream playerId="1" />
        <PongGame />
        <WebcamStream playerId="2" />
      </div>
    </main>
  )
}

