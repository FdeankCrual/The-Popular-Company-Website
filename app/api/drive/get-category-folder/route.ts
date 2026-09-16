import { NextResponse } from 'next/server';
import { findOrCreateFolder } from '@/lib/googleDrive';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, yearName, monthName, taskName, categoryName } = body;

    if (!clientName) {
      return NextResponse.json({ error: 'Missing clientName' }, { status: 400 });
    }

    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ error: 'Missing ROOT_FOLDER_ID' }, { status: 500 });
    }

    let targetFolderId = rootFolderId;
    
    if (yearName) targetFolderId = await findOrCreateFolder(String(yearName), targetFolderId);
    if (monthName) targetFolderId = await findOrCreateFolder(String(monthName), targetFolderId);
    if (clientName) targetFolderId = await findOrCreateFolder(String(clientName), targetFolderId);
    if (taskName) targetFolderId = await findOrCreateFolder(String(taskName), targetFolderId);
    
    let categoryFolderId = targetFolderId;
    if (categoryName) {
      categoryFolderId = await findOrCreateFolder(String(categoryName), targetFolderId);
    }

    return NextResponse.json({ folderId: categoryFolderId });
  } catch (error) {
    const err = error as Error;
    console.error('Error in get-category-folder:', err);
    return NextResponse.json({ error: 'Failed', details: err.message }, { status: 500 });
  }
}
