// src/app/page.tsx
import TierList from "src/app/_components/TierList";

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to My T3 TierList App</h1>
      <TierList />
    </main>
  );
}
