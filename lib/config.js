// API Configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
export const WA_URL = process.env.NEXT_PUBLIC_WA_URL;

// Socket Configuration
export const SOCKET_URL = API_URL.replace("/api/v1", "");
