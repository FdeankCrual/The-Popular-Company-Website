import { getDriveClient } from './lib/googleDrive';
async function test() {
  try {
    const drive = await getDriveClient();
    const res = await drive.files.list({ pageSize: 1 });
    console.log("SUCCESS:", res.data);
  } catch (e: any) {
    console.log("ERROR:", e.message);
  }
}
test();
