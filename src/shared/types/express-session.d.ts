import 'express-session';

declare module 'express-session' {
  interface SessionData {
    sessionId: string; // Add your custom property here
    userId: string;
    createdAt: Data | string;
  }
}
