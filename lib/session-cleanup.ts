import { cleanupExpiredSessionsAction } from "@/actions/documents-actions";

const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // one day in milliseconds

export async function cleanupExpiredSessions() {
  try {
    const result = await cleanupExpiredSessionsAction();
    
    console.log(`Cleaned up expired sessions: ${result.status === "success" ? "success" : "failed"}`);
    
    return { success: result.status === "success" };
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    return { success: false, error };
  }
} 