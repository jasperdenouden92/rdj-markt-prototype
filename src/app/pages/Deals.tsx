import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

export default function Deals() {
  return (
    <div className="flex h-screen bg-rdj-bg-primary">
      <Sidebar data-annotation-id="deals-navigatie" />
      <div className="flex-1 flex flex-col overflow-hidden pt-[24px]">
        <PageHeader title="Deals" />
        <div className="flex-1 overflow-auto">
          <div className="p-[24px]">
            <p className="font-sans font-normal text-[16px] text-rdj-text-secondary">
              Overzicht van alle gesloten deals en contracten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}