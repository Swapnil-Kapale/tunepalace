'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from 'next/image';
import AudioPlayer from '@/components/AudioPlayer';

interface Song {
  name: string;
  artist: string;
  file: File | null;
  image: File | null;
}

interface SongData {
  name: string;
  artist: string;
  songFileUrl: string;
  coverImageUrl: string;
}

const Home = () => {
  const [song, setSong] = useState<Song>({
    name: "",
    artist: "",
    file: null, // Initialize as null
    image: null, // Initialize as null
  });

  const [songs, setSongs] = useState<SongData[]>([]); // State to store fetched songs

  // Initialize the File objects on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSong({
        ...song,
        file: new File([""], "", { type: "audio/mp3" }),
        image: new File([""], "", { type: "image/png" }),
      });
    }
  }, []);

  // Fetch songs from API on component mount
  useEffect(() => {
    fetch("/api/fetchsongs")
      .then((res) => res.json())
      .then((data) => {
        setSongs(data);
      })
      .catch((error) => {
        console.error("Error fetching songs:", error);
      });
  }, []);

  const handleUpload = () => {
    console.log(song);
    const formData = new FormData();
    formData.append("songName", song.name); // Use 'songName' to match server-side
    formData.append("artistName", song.artist); // Use 'artistName' to match server-side
    formData.append("songFile", song.file as Blob); // Use 'songFile' to match server-side
    formData.append("coverImage", song.image as Blob); // Use 'coverImage' to match server-side

    fetch("/api/s3-upload/", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from server:", data);
        // Optionally refetch songs after upload to show the new song
        fetch("/api/songs")
          .then((res) => res.json())
          .then((newData) => {
            setSongs(newData); // Update the state with new songs
          });
      })
      .catch((error) => {
        console.error("Error uploading data:", error);
      });
  };

  return (
    <div className="h-screen w-full flex flex-col p-10">
      <div className="flex justify-between items-center">
        <h1>
          <span className="font-bold text-xl">One-Stop For Music</span>
          <br />
          <span className="opacity-60">Just Listen What You Want</span>
        </h1>

        <Sheet>
          <SheetTrigger asChild>
            <Button>Upload Your Song</Button>
          </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>Upload song</SheetTitle>
              <SheetDescription>
                Upload original Work Only Avoid Copyrighted Content.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="song_name" className="text-right">
                  Song Name
                </Label>
                <Input
                  value={song.name}
                  onChange={(e) => setSong({ ...song, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="artist_name" className="text-right">
                  Artist Name
                </Label>
                <Input
                  value={song.artist}
                  onChange={(e) => setSong({ ...song, artist: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="song_file" className="text-right">
                  Song File
                </Label>
                <Input
                  id="song_file"
                  type="file"
                  onChange={(e) => setSong({ ...song, file: e.target.files?.[0] || null })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="song_image" className="text-right">
                  Song Image
                </Label>
                <Input
                  id="song_image"
                  type="file"
                  onChange={(e) => setSong({ ...song, image: e.target.files?.[0] || null })}
                  className="col-span-3"
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button onClick={handleUpload}>Upload Song</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="w-full h-full p-4 mt-4 flex flex-wrap">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div key={index} className="flex flex-col space-y-3 m-4 p-4 border rounded-lg shadow-lg h-1/2">
              <Image src={song.coverImageUrl} alt={`${song.name} cover`} width={225} height={250} className="rounded-xl object-cover" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{song.name}</h2>
                <p className="text-sm text-gray-600">{song.artist}</p>
                <AudioPlayer audioSrc={song.songFileUrl} />
              </div>
            </div>
          ))
        ) : (
          Array(12)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex flex-col space-y-3 m-10">
                <Skeleton className="w-[225px] h-[250px] rounded-xl " />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px] " />
                  <Skeleton className="h-4 w-[200px] " />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Home;