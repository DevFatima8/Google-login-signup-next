import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const getSecurePassword = () => {
  const password = process.env.COOKIE_KEY;
  
  if (!password) {
    throw new Error("COOKIE_KEY environment variable is not set");
  }
  
  if (password.length < 32) {
    console.warn(`Warning: COOKIE_KEY is only ${password.length} characters long.`);
    const padding = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    const paddedPassword = (password + padding).slice(0, 32);
    return paddedPassword;
  }
  
  return password;
};

export const sessionOptions = {
  password: getSecurePassword(),
  cookieName: "oauth-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error.message);
    return { user: null, destroy: async () => {}, save: async () => {} };
  }
}

export async function setSession(user) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    session.user = {
      id: user._id?.toString(),
      userId: user.userId,
      username: user.username,
      email: user.email,
      picture: user.picture,
      provider: user.provider,
    };
    await session.save();
    console.log("Session saved for user:", user.username);
    return session;
  } catch (error) {
    console.error("Error setting session:", error.message);
    throw error;
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    await session.destroy();
    console.log("Session destroyed successfully");
    return true;
  } catch (error) {
    console.error("Error destroying session:", error.message);
    return false;
  }
}