import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload a file to S3
async function uploadFileToS3(fileBuffer, fileName, contentType) {
  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log("File uploaded to S3:", fileName);
    return fileName;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("File upload failed");
  }
}

// Export a named POST function to handle the request
export async function POST(req) {
  try {
    const formData = await req.formData();

    // Retrieve song details and files from form data
    const songName = formData.get("songName");
    const artistName = formData.get("artistName");
    const songFile = formData.get("songFile");
    const coverImage = formData.get("coverImage");

    if (!songName || !artistName || !songFile || !coverImage) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Upload song file to S3
    const songFileBuffer = Buffer.from(await songFile.arrayBuffer());
    const songFileName = `songs/${songFile.name}`;
    await uploadFileToS3(songFileBuffer, songFileName, songFile.type);

    // Upload cover image to S3
    const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
    const coverImageName = `covers/${coverImage.name}`;
    await uploadFileToS3(coverImageBuffer, coverImageName, coverImage.type);

    // Create JSON metadata for the song
    const songMetadata = {
      songName,
      artistName,
      songFileUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${songFileName}`,
      coverImageUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${coverImageName}`,
    };

    // Convert the metadata to a buffer and upload as a JSON file
    const jsonMetadataBuffer = Buffer.from(JSON.stringify(songMetadata));
    const jsonFileName = `metadata/${songName.replace(/\s+/g, "_")}_metadata.json`;
    await uploadFileToS3(jsonMetadataBuffer, jsonFileName, "application/json");

    // Return success response with the metadata file name
    return NextResponse.json({ success: true, metadataFile: jsonFileName });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}