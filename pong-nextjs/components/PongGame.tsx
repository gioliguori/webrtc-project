import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function PongGame() {
  return (
    <Card className="w-full md:w-auto">
      <CardContent className="p-0">
        <Image
          src="https://media.giphy.com/media/xT9IgwHIxhPDiClVF6/giphy.gif"
          alt="Pong Game"
          width={720}
          height={480}
          className="rounded-lg"
        />
      </CardContent>
    </Card>
  )
}

