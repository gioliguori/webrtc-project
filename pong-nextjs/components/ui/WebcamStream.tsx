import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"

interface WebcamStreamProps {
  playerId: string
}

export default function WebcamStream({ playerId }: WebcamStreamProps) {
  return (
    <Card className="w-full md:w-auto">
      <CardContent className="p-0">
        <Image
          src="https://media.giphy.com/media/l3q2FnW3yZRJVZH2g/giphy.gif"
          alt={`Player ${playerId} Webcam`}
          width={320}
          height={240}
          className="rounded-t-lg"
        />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm font-medium">Giocatore {playerId}</p>
      </CardFooter>
    </Card>
  )
}

