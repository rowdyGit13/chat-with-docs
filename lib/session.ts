"use client";

import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'chat_with_docs_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // one day in milliseconds

export interface SessionData {
  id: string;
  lastAccessed: number;
}

export function getSession(): SessionData {
  // Only run on client
  if (typeof window === 'undefined') {
    return createNewSession();
  }

  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) {
      return createNewSession();
    }
    
    const session = JSON.parse(sessionData) as SessionData;
    const now = Date.now();
    
    // Check if session has expired
    if (now - session.lastAccessed > SESSION_EXPIRY) {
      return createNewSession();
    }
    
    // Update last accessed time
    updateSessionTimestamp(session.id);
    
    return session;
  } catch (error) {
    console.error('Error reading session:', error);
    return createNewSession();
  }
}

export function createNewSession(): SessionData {
  const session = {
    id: uuidv4(),
    lastAccessed: Date.now()
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return session;
}

export function updateSessionTimestamp(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (sessionData) {
      const session = JSON.parse(sessionData) as SessionData;
      
      if (session.id === id) {
        session.lastAccessed = Date.now();
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
  } catch (error) {
    console.error('Error updating session timestamp:', error);
  }
}

export function getSessionId(): string {
  return getSession().id;
}

// Clear the session
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
} 