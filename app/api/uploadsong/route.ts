import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Utility to convert ArrayBuffer to Buffer
const arrayBufferToBuffer = (arrayBuffer: ArrayBuffer): Buffer => {
  return Buffer.from(arrayBuffer);
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title')?.toString();
    const artist = formData.get('artist')?.toString();
    const cover = formData.get('cover') as File;
    const song = formData.get('song') as File;

    if (!title || !artist || !cover || !song) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const uniqueId = uuidv4(); // Generate unique ID for filenames

    // Convert ArrayBuffer to Buffer
    const coverBuffer = arrayBufferToBuffer(await cover.arrayBuffer());
    const songBuffer = arrayBufferToBuffer(await song.arrayBuffer());

    // Prepare S3 upload using Upload class
    const coverUpload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `covers/${uniqueId}-${cover.name}`,
        Body: coverBuffer, // Pass the converted buffer
        ContentType: cover.type,
      },
    });

    const songUpload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `songs/${uniqueId}-${song.name}`,
        Body: songBuffer, // Pass the converted buffer
        ContentType: song.type,
      },
    });

    // Perform the uploads
    await coverUpload.done();
    await songUpload.done();

    // Save song metadata to the database
    const newSong = await prisma.song.create({
      data: {
        title,
        artist,
        coverUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/covers/${uniqueId}-${cover.name}`,
        songUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/songs/${uniqueId}-${song.name}`,
      },
    });
    revalidatePath('/')
    return new Response(JSON.stringify({ song: newSong }), { status: 200 });
  } catch (error) {
    console.error('Error uploading song:', error);
    return NextResponse.json({ error: 'Failed to upload song' }, { status: 500 });
  }
}


// export const dynamic = 'force-dynamic'
// import { S3Client } from '@aws-sdk/client-s3';
// import { Upload } from '@aws-sdk/lib-storage';
// import { PrismaClient } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';
// import { revalidatePath } from 'next/cache'

// const prisma = new PrismaClient();

// // Initialize S3 client
// const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// // Utility to convert ArrayBuffer to Buffer
// const arrayBufferToBuffer = (arrayBuffer: ArrayBuffer): Buffer => {
//   return Buffer.from(arrayBuffer);
// };

// // Named export for POST method
// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const title = formData.get('title')?.toString();
//     const artist = formData.get('artist')?.toString();
//     const cover = formData.get('cover') as File;
//     const song = formData.get('song') as File;

//     if (!title || !artist || !cover || !song) {
//       return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
//     }

//     const uniqueId = uuidv4(); // Generate unique ID for filenames

//     // Convert ArrayBuffer to Buffer
//     const coverBuffer = arrayBufferToBuffer(await cover.arrayBuffer());
//     const songBuffer = arrayBufferToBuffer(await song.arrayBuffer());

//     // Prepare S3 upload using Upload class
//     const coverUpload = new Upload({
//       client: s3,
//       params: {
//         Bucket: process.env.AWS_S3_BUCKET_NAME!,
//         Key: `covers/${uniqueId}-${cover.name}`,
//         Body: coverBuffer, // Pass the converted buffer
//         ContentType: cover.type,
//       },
//     });

//     const songUpload = new Upload({
//       client: s3,
//       params: {
//         Bucket: process.env.AWS_S3_BUCKET_NAME!,
//         Key: `songs/${uniqueId}-${song.name}`,
//         Body: songBuffer, // Pass the converted buffer
//         ContentType: song.type,
//       },
//     });

//     // Perform the uploads
//     await coverUpload.done();
//     await songUpload.done();

//     // Save song metadata to the database
//     const newSong = await prisma.song.create({
//       data: {
//         title,
//         artist,
//         coverUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/covers/${uniqueId}-${cover.name}`,
//         songUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/songs/${uniqueId}-${song.name}`,
//       },
//     });
//     revalidatePath('/')
//     return new Response(JSON.stringify({ song: newSong }), { status: 200 });
//   } catch (error) {
//     console.error('Error uploading song:', error);
//     return new Response(JSON.stringify({ error: 'Failed to upload song' }), { status: 500 });
//   }
// }