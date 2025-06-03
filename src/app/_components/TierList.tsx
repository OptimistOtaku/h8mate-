"use client";
import { useState, useEffect, useCallback } from "react";
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

interface TierListResponse {
  error?: string;
  tiers?: Tier[];
  bin?: string[];
}

interface TierListProps {
  classmateName: string;
}

export default function TierList({ classmateName }: TierListProps) {
  const { data: session } = useSession();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [bin, setBin] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTierList = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/tierlist?classmateName=${encodeURIComponent(classmateName)}`
      );
      const data = await response.json() as TierListResponse;
      if (data.error) {
        setError(data.error);
      } else {
        setTiers(data.tiers ?? []);
        setBin(data.bin ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tier list');
    } finally {
      setIsLoading(false);
    }
  }, [classmateName]);

  useEffect(() => {
    void fetchTierList();
  }, [fetchTierList]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source tier or bin
    const sourceTierIndex = tiers.findIndex((tier) =>
      tier.items.includes(activeId)
    );
    const isFromBin = sourceTierIndex === -1;

    // Find the destination tier or bin
    const destTierIndex = tiers.findIndex((tier) =>
      tier.items.includes(overId)
    );
    const isToBin = destTierIndex === -1;

    // Update local state
    const newTiers = [...tiers];
    const newBin = [...bin];

    if (isFromBin) {
      // Remove from bin
      const binIndex = newBin.indexOf(activeId);
      if (binIndex !== -1) {
        newBin.splice(binIndex, 1);
      }
    } else {
      // Remove from source tier
      const sourceItems = newTiers[sourceTierIndex]?.items ?? [];
      const sourceIndex = sourceItems.indexOf(activeId);
      if (sourceIndex !== -1) {
        sourceItems.splice(sourceIndex, 1);
      }
    }

    if (isToBin) {
      // Add to bin
      newBin.push(activeId);
    } else {
      // Add to destination tier
      const destItems = newTiers[destTierIndex]?.items ?? [];
      const destIndex = destItems.indexOf(overId);
      destItems.splice(destIndex, 0, activeId);
    }

    setTiers(newTiers);
    setBin(newBin);

    // Save to server
    try {
      const response = await fetch('/api/tierlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tiers: newTiers,
          bin: newBin,
          classmateName,
        }),
      });

      const data = await response.json() as TierListResponse;
      if (data.error) {
        setError(data.error);
        // Revert changes on error
        void fetchTierList();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tier list');
      // Revert changes on error
      void fetchTierList();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Tier List for {classmateName}
        </h1>
        <AuthButton />
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h2 className="mb-2 text-lg font-semibold">{tier.name}</h2>
              <div className="space-y-2">
                {tier.items.map((item) => (
                  <SortableItem key={item} id={item} name={item} />
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Bin</h2>
            <div className="space-y-2">
              {bin.map((item) => (
                <SortableItem key={item} id={item} name={item} />
              ))}
            </div>
          </div>
        </div>
      </DndContext>

      {session && (
        <div className="mt-8">
          <Comments tierId={classmateName} classmateName={classmateName} />
        </div>
      )}
    </div>
  );
}
