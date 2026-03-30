import { type ReactNode } from "react";
import { useDrop } from "react-dnd";
import { Cargo, Vessel } from "../data/mock-data";
import CargoCard from "./CargoCard";
import VesselCard from "./VesselCard";
import Button from "./Button";
import svgPaths from "../../imports/svg-5lxjaeghl9";

const columnColors: Record<string, string> = {
  intake: '#1567a4',
  werklijst: '#F79009',
  markt: '#12B76A',
  gesloten: '#667085',
};

interface DroppableColumnProps {
  title: string;
  status: 'intake' | 'werklijst' | 'markt' | 'gesloten';
  items: (Cargo | Vessel)[];
  onDrop: (itemId: string, newStatus: 'intake' | 'werklijst' | 'markt' | 'gesloten') => void;
  type: 'cargo' | 'vessel';
  /** Optional wrapper for individual cards, e.g. to add an AnnotationMarker */
  wrapCard?: (itemId: string, card: ReactNode) => ReactNode;
}

export default function DroppableColumn({ title, status, items, onDrop, type, wrapCard }: DroppableColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: type === 'cargo' ? 'CARGO' : 'VESSEL',
    drop: (item: { id: string }) => {
      onDrop(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const dotColor = columnColors[status];
  const addLabel = type === 'cargo' ? 'Lading toevoegen' : 'Vaartuig toevoegen';

  return (
    <div
      ref={drop}
      className={`flex flex-col bg-[#f9fafb] rounded-[12px] p-[12px] transition-colors ${isOver ? 'bg-[#f0f4f8]' : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-[8px] mb-[12px] px-[4px]">
        <div
          className="shrink-0 size-[8px] rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
          {title}
        </p>
        <span className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-[12px] flex-1">
        {items.map(item => {
          const card = type === 'cargo'
            ? <CargoCard key={item.id} cargo={item as Cargo} />
            : <VesselCard key={item.id} vessel={item as Vessel} />;
          return wrapCard ? <span key={item.id}>{wrapCard(item.id, card)}</span> : card;
        })}
      </div>

      {/* Add button */}
      <div className="mt-[12px]">
        <Button
          variant="tertiary-gray"
          size="sm"
          label={addLabel}
          leadingIcon={
            <svg fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p1b67fa00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          }
        />
      </div>
    </div>
  );
}