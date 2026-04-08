import { useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import * as api from "../data/api";
import { invalidateAllCaches } from "../data/useEntity";

const ENTITY_LABELS: Record<api.EntityType, string> = {
  relatie: "Relaties",
  contact_persoon: "Contact personen",
  lading_soort: "Lading soorten",
  lading_subsoort: "Lading subsoorten",
  bijzonderheid: "Bijzonderheden",
  haven: "Havens",
  bron: "Bronnen",
  gebruiker: "Gebruikers",
  lading_markt: "Ladingen (markt)",
  partij: "Partijen",
  ex: "Ex (zeeboten)",
  subpartij: "Subpartijen",
  lading_eigen: "Ladingen (eigen)",
  vaartuig_markt: "Vaartuigen (markt)",
  vaartuig_eigen: "Vaartuigen (eigen)",
  onderhandeling: "Onderhandelingen",
  bod: "Biedingen",
};

export default function DatabaseAdmin() {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<Record<string, number> | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<api.EntityType | null>(null);
  const [entityData, setEntityData] = useState<any[]>([]);
  const [loadingEntity, setLoadingEntity] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const msg = await api.seed();
      setSeedResult(msg);
      invalidateAllCaches();
      // Refresh stats after seed
      handleLoadStats();
    } catch (err: any) {
      setSeedResult(`Fout: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleLoadStats = async () => {
    setLoadingStats(true);
    try {
      const s = await api.stats();
      setStatsData(s);
    } catch (err: any) {
      console.error("Stats error:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleViewEntity = async (entity: api.EntityType) => {
    setSelectedEntity(entity);
    setLoadingEntity(true);
    try {
      const items = await api.list(entity);
      setEntityData(items);
    } catch (err: any) {
      console.error(`Error loading ${entity}:`, err);
      setEntityData([]);
    } finally {
      setLoadingEntity(false);
    }
  };

  return (
    <div className="flex h-screen bg-rdj-bg-primary overflow-hidden">
      <Sidebar data-annotation-id="databaseadmin-navigatie" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Database"
          subtitle="Beheer en inspecteer de KV-store data"
          tabs={[
            { id: "overview", label: "Overzicht" },
          ]}
          activeTab="overview"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl space-y-6">
            {/* Seed section */}
            <div className="border border-rdj-border-secondary rounded-lg p-5">
              <h2 className="text-[16px] font-semibold text-rdj-text-primary mb-2">
                Database seeden
              </h2>
              <p className="text-[14px] text-rdj-text-secondary mb-4">
                Vul de database met demo-data voor alle 17 entiteiten. Bestaande data met dezelfde keys wordt overschreven.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="px-4 py-2 bg-rdj-bg-brand text-rdj-text-brand text-[14px] font-medium rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {seeding ? "Bezig met seeden..." : "Seed database"}
                </button>
                <button
                  onClick={handleLoadStats}
                  disabled={loadingStats}
                  className="px-4 py-2 border border-rdj-border-primary text-rdj-text-primary text-[14px] font-medium rounded-lg hover:bg-rdj-bg-secondary transition-colors disabled:opacity-50"
                >
                  {loadingStats ? "Laden..." : "Ververs statistieken"}
                </button>
              </div>
              {seedResult && (
                <p className={`mt-3 text-[14px] ${seedResult.startsWith("Fout") ? "text-red-600" : "text-green-600"}`}>
                  {seedResult}
                </p>
              )}
            </div>

            {/* Stats grid */}
            {statsData && (
              <div className="border border-rdj-border-secondary rounded-lg p-5">
                <h2 className="text-[16px] font-semibold text-rdj-text-primary mb-4">
                  Entiteiten overzicht
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(Object.entries(ENTITY_LABELS) as [api.EntityType, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleViewEntity(key)}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        selectedEntity === key
                          ? "border-rdj-fg-brand bg-rdj-bg-brand"
                          : "border-rdj-border-secondary hover:bg-rdj-bg-secondary"
                      }`}
                    >
                      <div className="text-[12px] text-rdj-text-secondary">{label}</div>
                      <div className="text-[20px] font-semibold text-rdj-text-primary mt-0.5">
                        {statsData[key] ?? 0}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entity data viewer */}
            {selectedEntity && (
              <div className="border border-rdj-border-secondary rounded-lg p-5">
                <h2 className="text-[16px] font-semibold text-rdj-text-primary mb-4">
                  {ENTITY_LABELS[selectedEntity]} ({entityData.length})
                </h2>
                {loadingEntity ? (
                  <p className="text-[14px] text-rdj-text-secondary">Laden...</p>
                ) : entityData.length === 0 ? (
                  <p className="text-[14px] text-rdj-text-secondary">Geen data gevonden. Seed eerst de database.</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {entityData.map((item, idx) => (
                      <details
                        key={item.id || idx}
                        className="border border-rdj-border-secondary rounded-lg"
                      >
                        <summary className="px-3 py-2 cursor-pointer text-[14px] text-rdj-text-primary hover:bg-rdj-bg-secondary rounded-lg">
                          <span className="font-medium">
                            {item.naam || item.naam || item.titel || item.id}
                          </span>
                          <span className="text-rdj-text-tertiary ml-2">({item.id})</span>
                        </summary>
                        <pre className="px-3 pb-3 text-[12px] text-rdj-text-secondary overflow-x-auto">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
