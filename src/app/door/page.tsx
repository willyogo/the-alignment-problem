import type { Metadata } from "next";

export const metadata: Metadata = { title: "—" };

export default function DoorPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-green-500 font-mono text-lg animate-pulse">&#9608;</span>
    </main>
  );
}
