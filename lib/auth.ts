// Web Crypto API based session management for Edge Runtime (Middleware) and Node.js
const SECRET_KEY_STRING = process.env.ADMIN_SECRET || "SUPER_SECRET_FALLBACK_KEY_CHANGE_THIS_IN_PROD_123456";

// Helper to convert string to key
async function getSecretKey() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY_STRING);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to ArrayBuffer
function hexToBuffer(hex: string) {
  const view = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return view;
}

export type SessionPayload = {
  email: string;
  role: "SUPER_ADMIN" | "MANAGER" | "CREATOR";
  exp: number;
};

export async function createSessionCookie(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const sessionData: SessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days expiration
  };
  
  const dataString = JSON.stringify(sessionData);
  const encoder = new TextEncoder();
  
  const key = await getSecretKey();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(dataString));
  const signatureHex = bufferToHex(signatureBuffer);
  
  const base64Data = btoa(dataString);
  return `${base64Data}.${signatureHex}`;
}

export async function verifySessionCookie(cookieValue: string): Promise<SessionPayload | null> {
  try {
    const [base64Data, signatureHex] = cookieValue.split(".");
    if (!base64Data || !signatureHex) return null;

    const dataString = atob(base64Data);
    const sessionData: SessionPayload = JSON.parse(dataString);

    if (Date.now() > sessionData.exp) {
      return null; // Expired
    }

    const encoder = new TextEncoder();
    const key = await getSecretKey();
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuffer(signatureHex),
      encoder.encode(dataString)
    );

    return isValid ? sessionData : null;
  } catch (error) {
    console.error("Cookie Verification Error:", error);
    return null;
  }
}
