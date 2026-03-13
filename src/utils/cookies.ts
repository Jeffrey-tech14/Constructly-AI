/**
 * Cookie utility functions for managing browser cookies
 */

export interface CookieOptions {
  days?: number;
  path?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

const DEFAULT_DAYS = 30;

/**
 * Set a cookie with the given name, value, and options
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
): void => {
  const {
    days = DEFAULT_DAYS,
    path = "/",
    secure = false,
    sameSite = "Lax",
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookieString += `; path=${path}`;
  cookieString += `; SameSite=${sameSite}`;

  if (days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (secure) {
    cookieString += "; secure";
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string, path: string = "/"): void => {
  setCookie(name, "", { days: -1, path });
};

/**
 * Check if a cookie exists
 */
export const cookieExists = (name: string): boolean => {
  return getCookie(name) !== null;
};
