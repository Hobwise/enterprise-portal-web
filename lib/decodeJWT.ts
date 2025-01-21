interface JWTPayload {
  Email: string;
  Ip: string;
  UserId: string;
  BusinessId: string;
  UserRole: string;
  CooperateId: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
}

export function decodeJWT(token: any): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      throw new Error("Invalid token");
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
