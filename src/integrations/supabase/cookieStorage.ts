// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Cookie Storage Adapter for Supabase Auth
 * Stores authentication tokens in secure cookies
 * Based on proven pattern from production cookie storage
 */
export class CookieStorageAdapter implements Storage {
  private readonly isLocalhost = this.checkIsLocalhost();
  private readonly maxAge = 60 * 60 * 24 * 365; // 1 year in seconds

  constructor() {
    // Storage adapter initialized
  }

  private checkIsLocalhost(): boolean {
    if (typeof window === "undefined") {
      return false;
    }
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }

  /**
   * Set a value in the cookie storage
   */
  setItem(key: string, value: string): void {
    try {
      const cookieParts = [
        `${key}=${value}`,
        "path=/",
        `max-age=${this.maxAge}`,
      ];

      // Only add secure flags in production (non-localhost)
      if (!this.isLocalhost) {
        cookieParts.push("secure");
        cookieParts.push("samesite=lax");
      }

      document.cookie = cookieParts.join("; ");
    } catch (error) {
      console.error("[CookieStorage] Failed to set cookie:", error);
    }
  }

  /**
   * Get a value from the cookie storage
   */
  getItem(key: string): string | null {
    try {
      if (typeof document === "undefined") {
        return null;
      }

      const name = `${key}=`;
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(";");

      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length);
        }
      }

      return null;
    } catch (error) {
      console.error("[CookieStorage] Failed to get cookie:", error);
      return null;
    }
  }

  /**
   * Remove a value from the cookie storage
   */
  removeItem(key: string): void {
    try {
      const cookieParts = [`${key}=`, "path=/", "max-age=0"];

      if (!this.isLocalhost) {
        cookieParts.push("secure");
        cookieParts.push("samesite=lax");
      }

      document.cookie = cookieParts.join("; ");
    } catch (error) {
      console.error("[CookieStorage] Failed to remove cookie:", error);
    }
  }

  /**
   * Clear all cookies
   */
  clear(): void {
    try {
      if (typeof document === "undefined") {
        return;
      }

      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(";");

      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        if (name) {
          const cookieParts = [`${name}=`, "path=/", "max-age=0"];
          if (!this.isLocalhost) {
            cookieParts.push("secure");
            cookieParts.push("samesite=lax");
          }
          document.cookie = cookieParts.join("; ");
        }
      }
    } catch (error) {
      console.error("[CookieStorage] Failed to clear cookies:", error);
    }
  }

  /**
   * Get key at index (required by Storage interface)
   */
  key(index: number): string | null {
    try {
      if (typeof document === "undefined") {
        return null;
      }

      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(";");
      let count = 0;

      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        if (name && count === index) {
          return name;
        }
        if (name) {
          count++;
        }
      }

      return null;
    } catch (error) {
      console.error("[CookieStorage] Failed to get key:", error);
      return null;
    }
  }

  /**
   * Get number of cookies
   */
  get length(): number {
    try {
      if (typeof document === "undefined") {
        return 0;
      }

      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(";");
      return cookieArray.filter((cookie) => {
        const trimmed = cookie.trim();
        return trimmed.length > 0;
      }).length;
    } catch (error) {
      console.error("[CookieStorage] Failed to get length:", error);
      return 0;
    }
  }
}

/**
 * Factory function to create the cookie storage adapter
 */
export function createCookieStorage(): CookieStorageAdapter {
  return new CookieStorageAdapter();
}
