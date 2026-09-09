import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'];

function getAuthClient(): any {
  try {
    // 1. Prefer OAuth 2.0 User credentials (for uploading to a regular Google One account)
    if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN && process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_CLIENT_SECRET) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID,
        process.env.GOOGLE_DRIVE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
      });
      return oauth2Client;
    }

    // 2. Fallback to Service Account (for Workspace/Shared Drives or read-only)
    const credentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS || '{}');
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Missing Google Drive Credentials. Please provide an OAuth Refresh Token or a valid Service Account JSON.');
    }
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });
  } catch (err) {
    console.error('Failed to initialize Google Auth', err);
    throw new Error('Invalid GOOGLE_DRIVE_CREDENTIALS configuration.');
  }
}

export async function getDriveClient() {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth });
}

export async function findOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
  const drive = await getDriveClient();
  
  // Search if folder exists
  let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const response = await drive.files.list({
    q: query,
    spaces: 'drive',
    fields: 'files(id, name)',
  });

  if (response.data.files && response.data.files.length > 0 && response.data.files[0].id) {
    return response.data.files[0].id; // Return existing folder ID
  }

  // Create folder if it doesn't exist
  const fileMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  
  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  if (!folder.data.id) throw new Error('Failed to create folder');
  return folder.data.id;
}

export async function generateResumableUploadUrl(fileName: string, mimeType: string, parentFolderId: string, origin: string) {
  const auth = getAuthClient();
  let token;
  
  // OAuth2 client has getAccessToken directly. GoogleAuth requires getClient() first.
  if (auth.getAccessToken && typeof auth.getAccessToken === 'function' && !auth.getClient) {
    token = await auth.getAccessToken();
  } else {
    const client = await auth.getClient();
    token = await client.getAccessToken();
  }

  if (!token || !token.token) {
    throw new Error('Failed to get access token');
  }

  const metadata = {
    name: fileName,
    parents: [parentFolderId]
  };

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType,
      'Origin': origin,
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to initialize upload: ${response.statusText} - ${errorText}`);
  }

  // The Resumable Upload Session URL is in the Location header
  const locationUrl = response.headers.get('Location');
  if (!locationUrl) {
    throw new Error('No Location header returned from Google Drive API');
  }

  return locationUrl;
}

export async function listFilesInFolder(folderId: string) {
  const drive = await getDriveClient();
  
  // Get all files and folders directly inside this parent folder
  const query = `'${folderId}' in parents and trashed=false`;
  
  const response = await drive.files.list({
    q: query,
    spaces: 'drive',
    fields: 'files(id, name, mimeType, webViewLink, webContentLink, iconLink, thumbnailLink, createdTime)',
    orderBy: 'folder, modifiedTime desc'
  });

  return response.data.files || [];
}
