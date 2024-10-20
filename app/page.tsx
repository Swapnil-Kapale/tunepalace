'use client'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {

  const router = useRouter()

  const goToSongs = () => {
    router.push("/songs")
  }

  return (
    <div className=" w-screen h-screen flex flex-col gap-y-10 justify-center items-center">

      <h1 className= "font-bold text-5xl">Hello Music Lovers</h1>
      <Button onClick={goToSongs}>Lets Play Some Music</Button>

    </div>
  );
}
