import { deleteDocumentsBySessionIdAction } from "@/actions/documents-actions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }
    
    const result = await deleteDocumentsBySessionIdAction(sessionId);
    
    if (result.status === "success") {
      return NextResponse.json({ success: true, message: "Demo data reset successfully" });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset demo data" },
      { status: 500 }
    );
  }
} 