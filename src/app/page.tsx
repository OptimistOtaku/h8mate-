// src/app/page.tsx
import TierList from "src/app/_components/TierList";

export default function Home() {
  return (
    <main className="p-4">
      <TierList classmateName="Default" />
    </main>
  );
}
