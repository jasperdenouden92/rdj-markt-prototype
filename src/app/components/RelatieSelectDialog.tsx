import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Plus, Search, X } from "lucide-react";
import type { Relatie, Onderhandeling } from "../data/api";
import * as api from "../data/api";
import RelatieFormDialog from "./RelatieFormDialog";

interface RelatieSelectDialogProps {
  onSelect: (relatie: { id: string; naam: string }) => void;
  onClose: () => void;
}

export default function RelatieSelectDialog({ onSelect, onClose }: RelatieSelectDialogProps) {
  const [search, setSearch] = useState("");
  const [relaties, setRelaties] = useState<Relatie[]>([]);
  const [meestGebruikt, setMeestGebruikt] = useState<Relatie[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const [allRelaties, allOnderhandelingen] = await Promise.all([
        api.list<Relatie>("relatie"),
        api.list<Onderhandeling>("onderhandeling"),
      ]);
      setRelaties(allRelaties);

      // Count negotiations per relatie
      const counts = new Map<string, number>();
      for (const o of allOnderhandelingen) {
        counts.set(o.relatieId, (counts.get(o.relatieId) || 0) + 1);
      }

      // Sort by count desc, take top 10
      const sorted = [...allRelaties]
        .sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0))
        .slice(0, 10);
      setMeestGebruikt(sorted);
    }
    load();
  }, []);

  useEffect(() => {
    if (!showCreateDialog) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCreateDialog]);

  const isSearching = search.trim().length > 0;

  const filtered = isSearching
    ? relaties.filter((r) =>
        r.naam.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const handleCreateRelatie = (data: Partial<Relatie>) => {
    const newRelatie: Relatie = {
      id: `rel-${Date.now()}`,
      naam: data.naam || "Nieuwe relatie",
      contactPersoonIds: [],
      ...data,
    };
    api.create("relatie", newRelatie);
    setRelaties((prev) => [newRelatie, ...prev]);
    setShowCreateDialog(false);
    onSelect({ id: newRelatie.id, naam: newRelatie.naam });
  };

  const highlightMatch = (name: string) => {
    if (!isSearching) return name;
    return name.replace(
      new RegExp(`(${search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
      "<strong>$1</strong>"
    );
  };

  const relatieButton = (r: Relatie) => (
    <button
      key={r.id}
      type="button"
      onClick={() => onSelect({ id: r.id, naam: r.naam })}
      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-rdj-bg-primary-hover text-sm text-rdj-text-primary transition-colors cursor-pointer"
    >
      <span dangerouslySetInnerHTML={{ __html: highlightMatch(r.naam) }} />
      {r.plaats && (
        <span className="text-rdj-text-tertiary ml-1.5">{r.plaats}</span>
      )}
    </button>
  );

  if (showCreateDialog) {
    return (
      <RelatieFormDialog
        relatie={{ id: "", naam: search.trim(), contactPersoonIds: [] }}
        onSave={handleCreateRelatie}
        onClose={() => setShowCreateDialog(false)}
      />
    );
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold text-rdj-text-primary">
            Met welke relatie wil je een onderhandeling starten?
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-rdj-text-tertiary pointer-events-none" />
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Zoek naar relatie"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rdj-text-tertiary hover:text-rdj-text-primary"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {isSearching ? (
            <div className="px-3 pb-3">
              {filtered.map((r) => relatieButton(r))}

              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-rdj-text-tertiary">
                  Geen relaties gevonden
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-rdj-bg-primary-hover text-sm text-[#1567a4] font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="size-4" />
                Nieuwe relatie toevoegen: &ldquo;{search.trim()}&rdquo;
              </button>
            </div>
          ) : (
            <div className="px-3 pb-3">
              <div className="border-t border-rdj-border-primary mx-3 mb-2" />
              <p className="px-3 py-1.5 text-xs font-medium text-rdj-text-tertiary uppercase tracking-wide">
                Meest gebruikt
              </p>
              {meestGebruikt.map((r) => relatieButton(r))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
