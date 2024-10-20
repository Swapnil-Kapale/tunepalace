'use client'

import Image from "next/image"
import { PlayIcon, PauseIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import React, { useState } from "react";
import { TrashIcon } from "lucide-react";

interface MusicCardProps {
  id : number
  coverUrl: string
  title: string
  artist: string
  songUrl: string; // Make sure to include this
  deleteSong: (id: number) => void
}

export function MusicCardComponent({ id, coverUrl, title, artist, songUrl, deleteSong }: MusicCardProps) {
  const [audio] = useState(new Audio(songUrl)); // Create a new Audio object
  const [isPlaying, setIsPlaying] = useState(false); // State to track play status

  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause(); // Pause the audio
      setIsPlaying(false); // Update state
    } else {
      audio.play(); // Play the audio
      setIsPlaying(true); // Update state
    }
  };

  return (
    <Card className="w-[250px] overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={coverUrl}
          alt={`${title} by ${artist}`}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold leading-none truncate">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{artist}</p>
        </div>
        <div className="flex justify-between">
          <Button onClick={togglePlayPause} className="w-full mr-2">
            {isPlaying ? (
              <PauseIcon className="mr-2 h-4 w-4" />
            ) : (
              <PlayIcon className="mr-2 h-4 w-4" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={() => deleteSong(id)} className="w-10" variant="destructive">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// // components/MusicCardComponent.tsx
// 'use client'

// import Image from "next/image";
// import { PlayIcon, TrashIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

// interface MusicCardProps {
//   id: number; // Expecting id as a prop
//   coverUrl: string;
//   title: string;
//   artist: string;
//   onPlay: () => void;
//   deleteSong: (id: number) => void; // Expecting deleteSong function
// }

// export function MusicCardComponent({ id, coverUrl,songUrl ,title, artist, onPlay, deleteSong }: MusicCardProps) {
//   return (
//     <Card className="w-[250px] overflow-hidden">
//       <div className="relative aspect-square">
//         <Image
//           src={coverUrl}
//           alt={`${title} by ${artist}`}
//           fill
//           className="object-cover"
//         />
//       </div>
//       <CardContent className="p-4">
//         <div className="mb-2">
//           <h3 className="text-lg font-semibold leading-none truncate">{title}</h3>
//           <p className="text-sm text-muted-foreground truncate">{artist}</p>
//         </div>
//         <div className="flex justify-between">
//           <Button onClick={onPlay} className="w-full mr-2">
//             <PlayIcon className="mr-2 h-4 w-4" />
//             Play
//           </Button>
//           <Button onClick={() => deleteSong(id)} className="w-10" variant="destructive">
//             <TrashIcon className="h-4 w-4" />
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }