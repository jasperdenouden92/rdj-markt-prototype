import Button from "./Button";

const XIcon = () => (
  <svg fill="none" viewBox="0 0 20 20">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
  </svg>
);

interface FloatingActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Total number of items available for selection */
  totalCount: number;
  /** Label for the item type, e.g. "ladingen" or "vaartuigen" */
  itemLabel: string;
  /** Called when "Selecteer alle" is clicked */
  onSelectAll: () => void;
  /** Called when "Archiveren" is clicked */
  onArchive: () => void;
  /** Called when "Naar pijplijn sturen" is clicked */
  onMoveToPipeline: () => void;
}

export default function FloatingActionBar({
  selectedCount,
  totalCount,
  itemLabel,
  onSelectAll,
  onArchive,
  onMoveToPipeline,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-50">
      <div className="dark w-[800px]">
        <div className="bg-rdj-bg-primary rounded-[16px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] border border-rdj-border-primary">
          <div className="flex items-center px-[20px] py-[12px] gap-[16px]">
            {/* Selection count */}
            <p className="font-sans font-bold leading-[24px] text-rdj-text-primary text-[16px] whitespace-nowrap">
              {selectedCount} {itemLabel} geselecteerd
            </p>

            {/* Actions — right aligned */}
            <div className="flex-1 flex items-center justify-end gap-[12px]">
              {selectedCount < totalCount && (
                <Button
                  variant="tertiary-gray"
                  size="sm"
                  label={`Selecteer alle ${totalCount} ${itemLabel}`}
                  onClick={(e) => { e.stopPropagation(); onSelectAll(); }}
                />
              )}
              <Button
                variant="secondary"
                size="sm"
                label="Archiveren"
                leadingIcon={<XIcon />}
                onClick={(e) => { e.stopPropagation(); onArchive(); }}
              />
              <Button
                variant="primary"
                size="sm"
                label="Naar pijplijn sturen"
                onClick={(e) => { e.stopPropagation(); onMoveToPipeline(); }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}