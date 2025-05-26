import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: string;
  name: string;
  isSelected?: boolean;
}

export function SortableItem({ id, name, isSelected = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 rounded-lg shadow-md cursor-move 
        ${isSelected 
          ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white' 
          : 'bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500'
        }
        text-gray-800 font-medium
        border-2 ${isSelected ? 'border-purple-600' : 'border-yellow-500'}
        transform hover:scale-105 transition-all
        ${isDragging ? 'opacity-50 scale-110' : 'opacity-100'}
        animate-bounce-light`}
    >
      {name}
    </div>
  );
}

export default SortableItem;