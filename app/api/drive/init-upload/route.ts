import { NextResponse } from 'next/server';
import { findOrCreateFolder, generateResumableUploadUrl } from '@/lib/googleDrive';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, monthName, taskName, categoryName, fileName, mimeType } = body;
    const origin = request.headers.get('origin') || `http://${request.headers.get('host')}` || 'http://localhost:3000';

    if (!clientName || !fileName || !mimeType) {
      return NextResponse.json({ error: 'Missing clientName, fileName, or mimeType' }, { status: 400 });
    }

    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ error: 'Missing GOOGLE_DRIVE_ROOT_FOLDER_ID in environment variables' }, { status: 500 });
    }

    // 1. Find or create the client folder inside the root drive folder
    const clientFolderId = await findOrCreateFolder(clientName, rootFolderId);

    // 2. Find or create the month folder
    let monthFolderId = clientFolderId;
    if (monthName) {
      monthFolderId = await findOrCreateFolder(monthName, clientFolderId);
    }

    // 3. Find or create the task folder (Reel Name)
    let taskFolderId = monthFolderId;
    if (taskName) {
      taskFolderId = await findOrCreateFolder(taskName, monthFolderId);
    }

    // 4. Find or create the category folder (Raw, Final, Scripts, Thumbnails)
    let categoryFolderId = taskFolderId;
    if (categoryName) {
      categoryFolderId = await findOrCreateFolder(categoryName, taskFolderId);
    }

    // 5. Generate the resumable upload URL for this specific file in the category folder
    const uploadUrl = await generateResumableUploadUrl(fileName, mimeType, categoryFolderId, origin);

    return NextResponse.json({ uploadUrl, taskFolderId });
  } catch (error) {
    const err = error as Error;
    console.error('Error in /api/drive/init-upload:', err);
    return NextResponse.json(
      { error: 'Failed to initialize upload', details: err.message },
      { status: 500 }
    );
  }
}
