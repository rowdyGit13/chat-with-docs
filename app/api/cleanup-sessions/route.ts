import { cleanupExpiredSessionsAction } from "@/actions/documents-actions";
import { NextResponse } from "next/server";

// This would be called by a cron job in production
export async function POST() {
  try {
    const result = await cleanupExpiredSessionsAction();
    
    if (result.status === "success") {
      return NextResponse.json({ success: true, message: "Expired sessions cleaned up successfully" });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cleanup-sessions API:", error);
    return NextResponse.json(
      { success: false, message: "Error cleaning up expired sessions" },
      { status: 500 }
    );
  }
} 