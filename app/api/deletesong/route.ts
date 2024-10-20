import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedSong = await prisma.song.delete({
      where: {
        id: Number(id), // Ensure the id is a number
      },
    });

    return NextResponse.json(deletedSong);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Song not found or could not be deleted" },
      { status: 500 }
    );
  }
}

// export const dynamic = 'force-dynamic'
// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function DELETE(req: Request) {
//   try {
//     const { id } = await req.json(); // Parse the incoming request JSON

//     if (!id) {
//       return NextResponse.json({ error: 'ID is required' }, { status: 400 });
//     }

//     const deletedSong = await prisma.song.delete({
//       where: {
//         id: Number(id), // Ensure the id is a number
//       },
//     });

//     return NextResponse.json(deletedSong);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Song not found or could not be deleted' }, { status: 500 });
//   }
// }
