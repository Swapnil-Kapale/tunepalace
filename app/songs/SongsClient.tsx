'use client';

import React, { useState } from "react";
import { MusicCardComponent } from "@/components/MusicCardComponent";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  songUrl: string;
}

interface SongsClientProps {
  initialSongs: Song[];
}

export default function SongsClient({ initialSongs }: SongsClientProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const uploadSong = async () => {
    if (!title || !artist || !coverImage || !songFile) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields and upload both files.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("cover", coverImage);
    formData.append("song", songFile);

    try {
      const response = await fetch('/api/uploadsong', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const updatedSongsResponse = await fetch('/api/getsongs');
        const updatedSongsData = await updatedSongsResponse.json();
        setSongs(updatedSongsData.songs);

        setTitle('');
        setArtist('');
        setCoverImage(null);
        setSongFile(null);
        setIsDialogOpen(false);

        toast({
          title: "Success",
          description: "Song uploaded successfully!",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: `Failed to upload song: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading song:", error);
      toast({
        title: "Error",
        description: "An error occurred while uploading the song.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteSong = async (id: number) => {
    const confirmed = confirm(`Are you sure you want to delete this song?`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/deletesong', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (response.ok) {
        setSongs(songs.filter(song => song.id !== id));
        toast({
          title: "Success",
          description: "Song deleted successfully!",
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: `Failed to delete song: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting song:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the song.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-screen h-full flex flex-col items-end p-10">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-40">Upload Song</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Song</DialogTitle>
            <DialogDescription>
              Upload your favorite song here and share it with the world.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Song Name
              </Label>
              <Input id="name" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="artist" className="text-right">
                Artist Name
              </Label>
              <Input id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cover" className="text-right">
                Cover Image
              </Label>
              <Input id="cover" type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="song" className="text-right">
                Song File
              </Label>
              <Input id="song" type="file" accept="audio/*" onChange={(e) => setSongFile(e.target.files?.[0] || null)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={uploadSong} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full h-full flex flex-wrap p-10 gap-10">
        {songs.map((song) => (
          <MusicCardComponent
            key={song.id}
            id={song.id}
            coverUrl={song.coverUrl}
            songUrl={song.songUrl}
            title={song.title}
            artist={song.artist}
            deleteSong={deleteSong}
          />
        ))}
      </div>
    </div>
  );
}