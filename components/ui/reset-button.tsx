"use client";

import { useState } from "react";
import { Button } from "./button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { getSessionId } from "@/lib/session";

export function ResetButton() {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resetDemo = async () => {
    if (isResetting) return;
    
    try {
      setIsResetting(true);
      setMessage(null);
      
      const sessionId = getSessionId();
      
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage("Demo reset successfully!");
        // Refresh the page after 1 second to show the reset
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage("Failed to reset demo. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Reset error:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button 
        onClick={resetDemo} 
        variant="destructive"
        disabled={isResetting}
      >
        {isResetting ? (
          <>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Demo Data"
        )}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
} 