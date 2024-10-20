// app/songs/page.tsx
import fetchSongs  from '@/lib/songUtils';
import SongsClient from './SongsClient';

export const dynamic = 'force-dynamic'; // or use revalidate if you want ISR

export default async function SongsPage() {
  const songs = await fetchSongs();

  return <SongsClient initialSongs={songs} />;
}