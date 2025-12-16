import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  exp: number;
}

export const useAuth = () => {
  const [loggedInUser, setLoggedInUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const getToken = () => {
      if (typeof document === "undefined") return null;

      const cookieString = document.cookie
        .split("; ")
        .find((c) => c.startsWith("auth_token="));

      if (!cookieString) return null;

      return cookieString.split("=")[1];
    };

    const token = getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.exp * 1000 < Date.now()) return;

      setLoggedInUser(decoded);
    } catch (err) {
      console.error("Invalid JWT token:", err);
    }
  }, []);

  return { loggedInUser };
};