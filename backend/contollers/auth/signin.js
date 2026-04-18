import prisma from "../../lib/prisma.js";
import { getAuth } from "@clerk/express";

export async function SignIn(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        clerk_id: userId,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User profile not found in database" });
    }

    res.status(200).json({
      message: "Logged in successfully",
      user: user,
    });
  } catch (err) {
    console.error("SignIn Error:", err);
    return res.status(500).json({ message: "SignIn Failed", err });
  }
}
