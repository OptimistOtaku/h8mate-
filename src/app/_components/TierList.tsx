"use client";
import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent, DragOverEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import Comments from "./Comments";
import { AuthButton } from "./AuthButton";

interface Tier {
  id: string;
  items: string[];
}

export default function TierList() {
  const defaultTiers: Tier[] = [
    { id: "Ruhani level", items: [] },
    { id: "Can FW them", items: [] },
    { id: "gay baiyye", items: [] },
    { id: "ewww", items: [] },
    { id: "who are they again?", items: [] },
  ];

  const defaultBin: string[] = [
    "Yash",
  "Vatts Kumar",
  "Vyan Sharma",
  "Vaidic Srivastava",
  "Manvi Tanwar",
  "Ayush Kumar Singh",
  "Mansi Saxena",
  "Shreeya Bajaj",
  "Ayush Chaudhary",
  "Garvit Sisodia",
  "Abha Rauthan",
  "Ashmit Rana",
  "Abdul Arkan Siddiqui",
  "Lavanya Aggarwal",
  "Mohammad Kazim Ali",
  "Vaibhav Singh",
  "Akshat Tyagi",
  "Satvik Sharma",
  "Reyansh Rawat",
  "Hiya Saini",
  "Vansh Mahajan",
  "Harshavardhan Kaushik",
  "Varun Vishal",
  "Krishnanjali Banik",
  "Ananya Kumar",
  "Maher Sharma",
  "Ritisha Dagar",
  "Loveyansh Singh",
  "Rishank Veermanya",
  "Manav Kasnia",
  "Luckshay Baisoya",
  "Anshu Bansal",
  "Raghav Pandey",
  "Sahib Suri",
  "Krish Garg",
  "Ruhani Gill",
  "Kunal Singh",
  "Navya Aggarwal",
  "Mishra Tarun Sunil",
  "Kanika Joshi",
  "Aditya Kaushal",
  "Ronak Sharma",
  "Priya Raj",
  "Tanush Virmani",
  "Mohammad Aaryaan Reyaz",
  "Garvit",
  "Arjun Maheshwari",
  "Harsh Singhal",
  "Yugansh Bansal",
  "Pari Rathi",
  "Shiva Solanki",
  "Yash Gupta",
  "Ami Yadav",
  "Sujal Kalauni",
  "Yash Yadav",
  "Satyam",
  "Aditya",
  "Dhruv Aggarwal",
  "Reet Chadha"
  ];

  const [tiers, setTiers] = useState<Tier[]>(defaultTiers);
  const [bin, setBin] = useState<string[]>(defaultBin);
  const [selectedItem, setSelectedItem] = useState<{name: string; tierId: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved tier list on component mount
  useEffect(() => {
    const loadTierList = async () => {
      try {
        console.log('Loading tier list...');
        const response = await fetch('/api/tierlist');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load tier list');
        }
        const data = await response.json();
        
        if (data.tiers && data.bin) {
          console.log('Tier list loaded successfully');
          setTiers(data.tiers);
          setBin(data.bin);
        } else {
          console.log('No saved tier list found, using defaults');
          setTiers(defaultTiers);
          setBin(defaultBin);
        }
      } catch (error) {
        console.error('Error loading tier list:', error);
        alert('Failed to load tier list. Using default tiers.');
        setTiers(defaultTiers);
        setBin(defaultBin);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTierList();
  }, []);

  // Save tier list whenever it changes
  useEffect(() => {
    const saveTierList = async () => {
      if (isLoading) return; // Don't save during initial load

      try {
        console.log('Saving tier list...');
        // Validate data before sending
        if (!Array.isArray(tiers) || !Array.isArray(bin)) {
          throw new Error('Invalid tier list data structure');
        }

        // Validate each tier
        for (const tier of tiers) {
          if (!tier.id || !Array.isArray(tier.items)) {
            throw new Error('Invalid tier structure');
          }
        }

        const response = await fetch('/api/tierlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tiers, bin }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save tier list');
        }

        const savedData = await response.json();
        console.log('Successfully saved tier list:', savedData);
      } catch (error) {
        console.error('Error saving tier list:', error);
        alert('Failed to save tier list. Please try again.');
      }
    };

    void saveTierList();
  }, [tiers, bin, isLoading]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedItem = active.id as string;
    const targetId = over.id as string;

    // Find source tier
    const sourceTier = tiers.find((tier) => tier.items.includes(draggedItem));

    // Find destination tier
    const destinationTier = tiers.find((tier) => tier.id === targetId);

    // If dragging from bin to a tier
    if (bin.includes(draggedItem) && destinationTier) {
      setBin((prevBin) => prevBin.filter((item) => item !== draggedItem));
      setTiers((prevTiers) =>
        prevTiers.map((tier) =>
          tier.id === targetId
            ? { ...tier, items: [...tier.items, draggedItem] }
            : tier
        )
      );
      return;
    }

    // If dragging between tiers
    if (sourceTier && destinationTier) {
      setTiers((prevTiers) =>
        prevTiers.map((tier) => {
          if (tier.id === sourceTier.id) {
            return {
              ...tier,
              items: tier.items.filter((item) => item !== draggedItem),
            };
          }
          if (tier.id === destinationTier.id) {
            return {
              ...tier,
              items: [...tier.items, draggedItem],
            };
          }
          return tier;
        })
      );
      return;
    }

    // If dragging to bin
    if (sourceTier && targetId === "bin") {
      setTiers((prevTiers) =>
        prevTiers.map((tier) =>
          tier.id === sourceTier.id
            ? {
                ...tier,
                items: tier.items.filter((item) => item !== draggedItem),
              }
            : tier
        )
      );
      setBin((prevBin) => [...prevBin, draggedItem]);
      return;
    }
  };

  const handleItemClick = (name: string, tierId: string) => {
    setSelectedItem(selectedItem?.name === name ? null : { name, tierId });
  };

  // Create a custom droppable component for tiers
  const DroppableTier = ({ tier }: { tier: Tier }) => {
    const { setNodeRef } = useDroppable({
      id: tier.id,
    });

    const getTierColor = (tierId: string) => {
      switch (tierId) {
        case 'Ruhani level':
          return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
        case 'Can FW them':
          return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
        case 'gay baiyye':
          return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800';
        case 'ewww':
          return 'bg-gradient-to-r from-green-400 to-green-500 text-white';
        case 'who are they again?':
          return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white';
        default:
          return 'bg-gray-100';
      }
    };

    return (
      <div
        ref={setNodeRef}
        className={`mb-6 rounded-xl shadow-lg overflow-visible transform hover:scale-[1.02] transition-all
          ${getTierColor(tier.id)} border-4 border-white`}
      >        
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
            <span className="bg-white/20 rounded-lg px-4 py-2 truncate max-w-[80%] text-center">
              {tier.id}
            </span>
          </h2>
          <div className="flex gap-3 flex-wrap p-2 min-h-[80px] bg-white/10 rounded-lg relative group">
            {tier.items.map((item) => (
              <div key={item} onClick={() => handleItemClick(item, tier.id)}>
                <SortableItem 
                  id={item} 
                  name={item}
                  isSelected={selectedItem?.name === item} 
                />
              </div>
            ))}
            {tier.items.map((item) => 
              selectedItem?.name === item && (
                <div key={`comment-${item}`} className="mt-4 w-full">
                  <Comments tierId={tier.id} classmateName={item} />
                </div>
              )
            )}
            <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
      </div>
    );
  };

  const handleReset = useCallback(async () => {
    if (window.confirm('Are you sure you want to reset all tiers? This cannot be undone.')) {
      setIsLoading(true);
      try {
        console.log('Resetting tier list...');
        const response = await fetch('/api/tierlist', {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reset tiers');
        }

        console.log('Tier list reset successfully');
        setTiers(defaultTiers);
        setBin(defaultBin);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error resetting tiers:', error);
        alert('Failed to reset tiers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="fixed top-4 left-4 z-10">
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Resetting...' : 'Reset All Tiers'}
        </button>
      </div>

      <div className="fixed top-4 right-4 z-10">
        <AuthButton />
      </div>

      <div className="flex flex-col mb-8 px-8 pt-16">
        <div className="text-center">
          <h1 className="text-5xl font-black mb-2 animate-bounce-slow">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-gradient">
              Welcome to H8 Mate
            </span>
          </h1>
          <div className="text-lg font-medium text-purple-600 animate-pulse mb-4">
            🌟 Hate your classmates! 🌟
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {tiers.map((tier) => (
            <DroppableTier key={tier.id} tier={tier} />
          ))}
        </div>

        {/* Bin for unassigned classmates */}
        <div
          ref={useDroppable({ id: "bin" }).setNodeRef}
          className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl border-4 border-white group"
        >
          <h2 className="text-2xl font-bold text-center mb-4 text-white">Unassigned Classmates</h2>
          <div className="flex gap-3 flex-wrap p-4 bg-white/10 rounded-lg min-h-[100px] relative">
            {bin.map((name) => (
              <SortableItem key={name} id={name} name={name} />
            ))}
            <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
      </DndContext>
    </div>
  );
}
