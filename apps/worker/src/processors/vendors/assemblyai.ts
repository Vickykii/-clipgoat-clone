import { AssemblyAI } from "assemblyai";
import { env } from "@/env";

export const assemblyAI = env.ASSEMBLYAI_API_KEY ? new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY }) : null;
