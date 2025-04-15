// page.tsx or another component file
import EphemeralWall from '@/components/EphemeralWallCardImage';

export default function EphemeralWallCard() {
  const notes = [
    { content: "gone soon...", color: "gray" as const },
    { content: "Testing", color: "yellow" as const },
    { content: "how are\n\nyou?", color: "pink" as const },
    { content: "Hello :)\n\nNo history,\nno profiles", color: "green" as const },
  ];

  return (
    <main className="container mx-auto p-4">
      <EphemeralWall 
        notes={notes}
        className="my-8" // Example of custom className
      />
    </main>
  );
}