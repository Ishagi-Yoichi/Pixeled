import { PrismaClient } from "../generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg, { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
