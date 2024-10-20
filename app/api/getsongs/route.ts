// app/api/getsongs/route.ts
import { NextResponse } from 'next/server';
import  fetchSongs  from '@/lib/songUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const songs = await fetchSongs();
  return NextResponse.json({ songs });
}