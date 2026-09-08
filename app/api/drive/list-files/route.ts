import { NextResponse } from 'next/server';
import { listFilesInFolder, findOrCreateFolder } from '@/lib/googleDrive';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientName = searchParams.get('clientName');
    const yearName = searchParams.get('yearName');
    const monthName = searchParams.get('monthName');
    const taskName = searchParams.get('taskName');
    const folderUrl = searchParams.get('folderUrl');

    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ error: 'Missing ROOT_FOLDER_ID' }, { status: 500 });
    }

    let targetFolderId: string | null | undefined = '';

    // If we have a direct folder URL, parse the ID from it
    if (folderUrl && folderUrl.includes('drive.google.com/drive/folders/')) {
      const parts = folderUrl.split('folders/');
      if (parts.length > 1) {
        targetFolderId = parts[1].split('?')[0]; // Remove any query parameters
      }
    }

    // Fallback: Traverse the tree to find the folder dynamically if folder URL is not available
    if (!targetFolderId && clientName && taskName) {
      let currentParentId = rootFolderId;
      
      if (yearName) currentParentId = await findOrCreateFolder(yearName, currentParentId);
      if (monthName) currentParentId = await findOrCreateFolder(monthName, currentParentId);
      if (clientName) currentParentId = await findOrCreateFolder(clientName, currentParentId);
      
      targetFolderId = await findOrCreateFolder(taskName, currentParentId);
    }

    if (!targetFolderId) {
      return NextResponse.json({ error: 'Could not determine folder ID' }, { status: 400 });
    }

    // Step 1: List all category folders inside the target task folder
    const categories = await listFilesInFolder(targetFolderId);
    
    // Step 2: Fetch files for each category folder concurrently
    const fileTree = await Promise.all(
      categories.map(async (category) => {
        if (category.mimeType === 'application/vnd.google-apps.folder' && category.id) {
          const files = await listFilesInFolder(category.id);
          return {
            id: category.id,
            name: category.name,
            files: files
          };
        }
        return null;
      })
    );

    // Filter out nulls (files that were in the root task folder, not in categories)
    const formattedTree = fileTree.filter(Boolean);

    return NextResponse.json({ tree: formattedTree });
  } catch (error) {
    const err = error as Error;
    console.error('Error in /api/drive/list-files:', err);
    return NextResponse.json({ error: 'Failed to list files', details: err.message }, { status: 500 });
  }
}
