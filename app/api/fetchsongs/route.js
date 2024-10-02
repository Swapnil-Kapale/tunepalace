import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to read the contents of an S3 object
async function getObjectData(Bucket, Key) {
  const command = new GetObjectCommand({ Bucket, Key });
  try {
    const data = await s3Client.send(command);
    return streamToString(data.Body);
  } catch (error) {
    console.error(`Failed to get object ${Key} from bucket ${Bucket}:`, error);
    return null;
  }
}

// Helper function to convert a stream to a string
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

export async function GET() {
  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

  // Command to list objects in the S3 bucket
  const listCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: "metadata/", // Prefix to filter only metadata files
  });

  try {
    // Fetch the list of objects in the bucket with the prefix
    const { Contents } = await s3Client.send(listCommand);
    if (!Contents || Contents.length === 0) {
      return NextResponse.json({ message: "No songs found." }, { status: 404 });
    }

    const songs = [];

    // Loop through all metadata files and fetch song details
    for (const item of Contents) {
      const metadataKey = item.Key;
      const metadataContent = await getObjectData(bucketName, metadataKey);

      if (metadataContent) {
        try {
          const songMetadata = JSON.parse(metadataContent);

          // Construct the song details with name, artist, image, and song file URL
          const songDetails = {
            name: songMetadata.songName,
            artist: songMetadata.artistName,
            songFileUrl: songMetadata.songFileUrl,
            coverImageUrl: songMetadata.coverImageUrl,
          };

          songs.push(songDetails);
        } catch (parseError) {
          console.error(`Failed to parse metadata content for ${metadataKey}:`, parseError);
        }
      }
    }

    // Return the JSON response containing all songs
    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error("Error fetching song data from S3:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}