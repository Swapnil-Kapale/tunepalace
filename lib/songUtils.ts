// lib/songUtils.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function fetchSongs() {
  try {
    const songs = await prisma.song.findMany();
    return songs;
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}