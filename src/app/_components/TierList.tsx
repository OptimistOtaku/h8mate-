"use client";
import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "src/app/_components/SortableItem";

interface Tier {
  id: string;
  items: string[];
}

export default function TierList() {
  const [tiers, setTiers] = useState<Tier[]>([
    { id: "S", items: [] },
    { id: "A", items: [] },
    { id: "B", items: [] },
  ]);
  
  const [bin, setBin] = useState<string[]>(["Alice", "Bob", "Charlie", "David", "Eve", "Frank"]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTiers((prevTiers) => {
      let newBin = [...bin];
      const draggedItem = active.id.toString();

      const sourceTier = prevTiers.find((tier) => tier.items.includes(draggedItem));
      const destinationTier = prevTiers.find((tier) => tier.id === over.id.toString());

      // Check if dragged from the bin
      if (bin.includes(draggedItem)) {
        newBin = bin.filter((name) => name !== draggedItem);
      }

      if (!destinationTier) return prevTiers;

      return prevTiers.map((tier) => {
        if (tier === sourceTier) {
          return { ...tier, items: tier.items.filter((i) => i !== draggedItem) };
        }
        if (tier === destinationTier) {
          return { ...tier, items: [...tier.items, draggedItem] };
        }
        return tier;
      });
    });

    setBin((prevBin) => prevBin.filter((name) => name !== active.id.toString()));
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Classmates Tier List</h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {tiers.map((tier) => (
          <div key={tier.id} className="mb-4 p-4 border rounded-lg bg-gray-100">
            <h2 className="text-lg font-semibold">Tier {tier.id}</h2>
            <SortableContext items={tier.items} strategy={verticalListSortingStrategy}>
              <div className="flex gap-2 flex-wrap">
                {tier.items.map((item) => (
                  <SortableItem key={item} id={item} name={item} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}

        {/* Bin for unassigned classmates */}
        <div className="mt-6 p-4 border rounded-lg bg-gray-200">
          <h2 className="text-lg font-semibold text-center">Unassigned Classmates</h2>
          <SortableContext items={bin} strategy={verticalListSortingStrategy}>
            <div className="flex gap-2 flex-wrap">
              {bin.map((name) => (
                <SortableItem key={name} id={name} name={name} />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
