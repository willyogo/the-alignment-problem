import type { Metadata } from "next";
import { MemorialClient } from "./MemorialClient";

export const metadata: Metadata = { title: "Memorial — The Alignment Problem" };

export default function MemorialPage() { return <MemorialClient />; }
