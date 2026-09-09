import { NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/googleDrive';

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    const drive = await getDriveClient();
    
    // We use delete instead of trash so it permanently removes it to free up space.
    // If you want it to go to trash instead, use drive.files.update({ fileId, requestBody: { trashed: true } })
    await drive.files.delete({
      fileId: fileId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    console.error('Error in /api/drive/delete-file:', err);
    return NextResponse.json({ error: 'Failed to delete file', details: err.message }, { status: 500 });
  }
}
