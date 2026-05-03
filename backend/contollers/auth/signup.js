import prisma from "../../lib/prisma.js";
import { getAuth } from "@clerk/express";

export async function Signup(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized User!" });
  }

  const { email } = req.body;

  try {
    const user = await prisma.users.upsert({
      where: { email: email },
      update: { clerk_id: userId },
      create: {
        clerk_id: userId,
        email: email,
      },
    });

    res.status(201).json({ message: "User synced with database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
