"use client";
import { useState, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableItem } from "./SortableItem";
import Comments from "./Comments";
import AuthButton from "./AuthButton";
import { useSession } from "next-auth/react";

interface Tier {
  id: string;
  name: string;
  items: string[];
}

const DEFAULT_TIERS: Tier[] = [
  { id: "S", name: "S", items: [] },
  { id: "A", name: "A", items: [] },
  { id: "B", name: "B", items: [] },
  { id: "C", name: "C", items: [] },
  { id: "D", name: "D", items: [] },
  { id: "F", name: "F", items: [] },
];
const DEFAULT_BIN: string[] = [
  "Classmate 1",
  "Classmate 2",
  "Classmate 3",
];

export default function TierList({ classmateName }: { classmateName: string }) {
  const { data: session, status } = useSession();
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS.map(t => ({ ...t })));
  const [bin, setBin] = useState<string[]>([...DEFAULT_BIN]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved tier list for authenticated user
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    setIsLoading(true);
    fetch(`/api/tierlist?classmateName=${encodeURIComponent(classmateName)}`)
      .then(res => res.json())
      .then((data) => {
        if (data.tiers) setTiers(data.tiers);
        if (data.bin) setBin(data.bin);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [status, session, classmateName]);

  // Handle drag and drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const sourceTierIndex = tiers.findIndex(t => t.items.includes(activeId));
    const isFromBin = sourceTierIndex === -1;
    const destTierIndex = tiers.findIndex(t => t.items.includes(overId));
    const isToBin = destTierIndex === -1;
    const newTiers = [...tiers];
    const newBin = [...bin];
    if (isFromBin) {
      const binIndex = newBin.indexOf(activeId);
      if (binIndex !== -1) newBin.splice(binIndex, 1);
    } else {
      const sourceItems = newTiers[sourceTierIndex]?.items;
      const sourceIndex = sourceItems?.indexOf(activeId);
      if (sourceItems && sourceIndex !== undefined && sourceIndex !== -1) sourceItems.splice(sourceIndex, 1);
    }
    if (isToBin) {
      newBin.push(activeId);
    } else {
      const destItems = newTiers[destTierIndex]?.items;
      const destIndex = destItems?.indexOf(overId);
      if (destItems && destIndex !== undefined && destIndex !== -1) destItems.splice(destIndex, 0, activeId);
    }
    setTiers(newTiers);
    setBin(newBin);
    // Persist for signed-in users
    if (session?.user?.id) {
      try {
        setIsLoading(true);
        const response = await fetch("/api/tierlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tiers: newTiers, bin: newBin, classmateName }),
        });
        const data = await response.json();
        if (data.error) setError(data.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save tier list");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tier List for {classmateName}</h1>
        <AuthButton />
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">{tier.name}</h2>
              <div className="space-y-2">
                {tier.items.map((item) => (
                  <SortableItem key={item} id={item} name={item} />
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-lg border bg-gray-50 p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Bin</h2>
            <div className="space-y-2">
              {bin.map((item) => (
                <SortableItem key={item} id={item} name={item} />
              ))}
            </div>
          </div>
        </div>
      </DndContext>
      {session?.user?.id ? (
        <div className="mt-8">
          <Comments tierId={classmateName} classmateName={classmateName} />
        </div>
      ) : (
        <div className="mt-8 text-center text-gray-500">
          <span>Sign in to comment on classmates.</span>
        </div>
      )}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/60 z-50">
          <div className="text-lg">Saving...</div>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-600 text-center">{error}</div>
      )}
    </div>
  );
}
