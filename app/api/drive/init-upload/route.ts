import { NextResponse } from 'next/server';
import { findOrCreateFolder, generateResumableUploadUrl } from '@/lib/googleDrive';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, yearName, monthName, taskName, categoryName, fileName, mimeType, files } = body;
    const origin = request.headers.get('origin') || `http://${request.headers.get('host')}` || 'http://localhost:3000';

    const filesToInit = files || (fileName && mimeType ? [{ fileName, mimeType }] : []);

    if (!clientName || filesToInit.length === 0) {
      return NextResponse.json({ error: 'Missing clientName or files' }, { status: 400 });
    }

    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ error: 'Missing GOOGLE_DRIVE_ROOT_FOLDER_ID in environment variables' }, { status: 500 });
    }

    let targetFolderId = rootFolderId;

    if (yearName) {
      targetFolderId = await findOrCreateFolder(yearName, targetFolderId);
    }
    if (monthName) {
      targetFolderId = await findOrCreateFolder(monthName, targetFolderId);
    }
    if (clientName) {
      targetFolderId = await findOrCreateFolder(clientName, targetFolderId);
    }
    if (taskName) {
      targetFolderId = await findOrCreateFolder(taskName, targetFolderId);
    }

    // We return the task folder ID so the frontend can link directly to the task
    const taskFolderId = targetFolderId;
    let categoryFolderId = taskFolderId;
    if (categoryName) {
      categoryFolderId = await findOrCreateFolder(categoryName, taskFolderId);
    }

    // 5. Generate the resumable upload URL for each file in the category folder
    const uploadUrls = await Promise.all(
      filesToInit.map((f: any) => generateResumableUploadUrl(f.fileName, f.mimeType, categoryFolderId, origin))
    );

    // Keep backwards compatibility for single file
    const uploadUrl = uploadUrls[0];

    return NextResponse.json({ uploadUrl, uploadUrls, taskFolderId, folderId: categoryFolderId });
  } catch (error) {
    const err = error as Error;
    console.error('Error in /api/drive/init-upload:', err);
    return NextResponse.json(
      { error: 'Failed to initialize upload', details: err.message },
      { status: 500 }
    );
  }
}
