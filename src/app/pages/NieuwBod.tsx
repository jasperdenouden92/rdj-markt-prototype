import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import Sidebar from "../components/Sidebar";
import CargoDetailSidebar from "../components/CargoDetailSidebar";
import RadioButton from "../components/RadioButton";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";
import ItemOfferCard from "../components/ItemOfferCard";

interface BidFormData {
  bidType: 'uitgaand' | 'inkomend';
  remark: string;
  tonnage: string;
  tonnageUnit: 'Ton' | 'm³';
  price: string;
  priceUnit: 'Per ton' | 'Per m³' | 'Blokracht';
  loadingLocation: string;
  loadingLaytime: string;
  loadingDays: string;
  loadingWaitingTime: 'Uren' | 'Dagen';
  loadingLiggeldDuwvaak: boolean;
  unloadingLaytime: boolean;
  unloadingDays: string;
  unloadingWaitingTime: 'Uren' | 'Dagen';
  unloadingLiggeld: string;
  unloadingLiggeldDuwvaak: boolean;
}

/* ── Breadcrumb chevron ── */
function BreadcrumbChevron() {
  return (
    <svg className="block size-[16px]" fill="none" viewBox="0 0 16 16">
      <path d="M6 4L10 8L6 12" stroke="#D0D5DD" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
    </svg>
  );
}

/* ── Plus icon ── */
const PlusIcon = () => (
  <svg fill="none" viewBox="0 0 20 20">
    <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

/* ── Form card wrapper ── */
function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white relative rounded-[12px] w-full">
      <div aria-hidden="true" className="absolute border border-rdj-border-secondary border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="p-[24px] flex flex-col gap-[20px]">
        <p className="font-sans font-bold leading-[28px] text-rdj-text-primary text-[18px]">
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

export default function NieuwBod() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const negotiationId = (location.state as any)?.negotiationId;

  // Detect entity type from route
  const isVaartuig = location.pathname.includes("/vaartuig/");

  const selectedRelatie = { id: 'prefilled', naam: 'Alpha Barging Rotterdam B.V.' };
  const relatieContact = 'Frits van Dam';

  // Offered item (pre-filled from context)
  const [offeredItem, setOfferedItem] = useState<{ id: string; naam: string; subtext: string; meta?: string } | null>({
    id: 'prefilled-vessel',
    naam: 'Schipnaam vanuit markt',
    subtext: '2.000 ton Motorschip',
    meta: 'Sinds Ma 13 Jan',
  });

  // Pre-filled data from previous bid
  const [formData, setFormData] = useState<BidFormData>({
    bidType: 'uitgaand',
    remark: 'We hebben interesse in uw aanbod.',
    tonnage: '3000',
    tonnageUnit: 'Ton',
    price: '3,60',
    priceUnit: 'Per ton',
    loadingLocation: 'Uren conform Nederlands Wettelijk',
    loadingLaytime: 'Nederlands Wettelijk',
    loadingDays: '12',
    loadingWaitingTime: 'Uren',
    loadingLiggeldDuwvaak: true,
    unloadingLaytime: true,
    unloadingDays: '8',
    unloadingWaitingTime: 'Uren',
    unloadingLiggeld: 'Nederlands Wettelijk',
    unloadingLiggeldDuwvaak: true,
  });

  const handleSubmit = () => {
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar data-annotation-id="nieuwbod-navigatie" />
      
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Header */}
          <div className="border-b border-rdj-border-secondary px-[32px] py-[24px]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-[8px] mb-[20px]">
              <button 
                onClick={() => navigate('/markt/bevrachting')}
                className="flex items-center justify-center p-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover"
              >
                <p className="font-sans font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">Markt</p>
              </button>
              <BreadcrumbChevron />
              <button
                onClick={() => navigate('/markt/onderhandelingen')}
                className="flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover"
              >
                <p className="font-sans font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">Onderhandelingen</p>
              </button>
              <BreadcrumbChevron />
              <div className="bg-rdj-bg-secondary flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0">
                <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] whitespace-nowrap">{selectedRelatie.naam}</p>
              </div>
            </div>

            {/* Title */}
            <p className="font-sans font-bold leading-[38px] text-rdj-text-primary text-[30px]">
              Nieuw bod toevoegen
            </p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[800px] mx-auto px-[32px] py-[32px] flex flex-col gap-[24px]">

              {/* ── Card: Relatie ── */}
              <FormCard title="Relatie">
                {/* Static relatie card (pre-filled, not editable) */}
                <div className="bg-white relative rounded-[10px] w-full">
                  <div aria-hidden="true" className="absolute border border-rdj-border-secondary border-solid inset-0 pointer-events-none rounded-[10px]" />
                  <div className="flex items-start p-[16px]">
                    <div className="flex flex-1 flex-col gap-[2px] items-start justify-center min-w-0">
                      <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] whitespace-nowrap">
                        {selectedRelatie.naam}
                      </p>
                      <p className="font-sans font-normal leading-[18px] text-rdj-text-secondary text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {relatieContact}
                      </p>
                    </div>
                  </div>
                </div>
              </FormCard>

              {/* ── Card: Bod ── */}
              <FormCard title="Bod">
                {/* Type bod */}
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[8px]">
                    Type bod *
                  </p>
                  <div className="flex gap-[16px]">
                    <RadioButton
                      checked={formData.bidType === 'uitgaand'}
                      onChange={() => setFormData({ ...formData, bidType: 'uitgaand' })}
                      label="Uitgaand"
                      icon={
                        <div className="overflow-clip relative size-[20px]">
                          <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                            <path d="M10.0003 4.16666V10L13.3337 11.6667M17.5003 10C17.5003 14.1421 14.1425 17.5 10.0003 17.5C5.85818 17.5 2.50033 14.1421 2.50033 10C2.50033 5.85786 5.85818 2.5 10.0003 2.5C14.1425 2.5 17.5003 5.85786 17.5003 10Z" stroke="#2E90FA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667"/>
                          </svg>
                        </div>
                      }
                    />
                    <RadioButton
                      checked={formData.bidType === 'inkomend'}
                      onChange={() => setFormData({ ...formData, bidType: 'inkomend' })}
                      label="Inkomend"
                      icon={
                        <div className="overflow-clip relative size-[20px]">
                          <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                            <path d="M18.3333 6.66667L10 12.5L1.66667 6.66667M3.16667 2.5H16.8333C17.9333 2.5 18.8333 3.4 18.8333 4.5V15.5C18.8333 16.6 17.9333 17.5 16.8333 17.5H3.16667C2.06667 17.5 1.16667 16.6 1.16667 15.5V4.5C1.16667 3.4 2.06667 2.5 3.16667 2.5Z" stroke="#2E90FA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667"/>
                          </svg>
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* Aangeboden vaartuig/lading */}
                <ItemOfferCard
                  type={isVaartuig ? "lading" : "vaartuig"}
                  value={offeredItem}
                  onChange={setOfferedItem}
                  label={isVaartuig ? "Aangeboden lading" : "Aangeboden vaartuig"}
                />

                {/* Opmerking */}
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Opmerking *
                  </p>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] resize-none h-[120px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                    placeholder="Voeg een opmerking toe..."
                  />
                </div>

                {/* Tonnage */}
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Tonnage
                  </p>
                  <div className="flex gap-[12px] items-center">
                    <input
                      type="text"
                      value={formData.tonnage}
                      onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })}
                      className="bg-white border border-rdj-border-primary rounded-[8px] flex-1 px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                    />
                    <div className="flex items-center gap-[8px]">
                      <RadioButton
                        checked={formData.tonnageUnit === 'Ton'}
                        onChange={() => setFormData({ ...formData, tonnageUnit: 'Ton' })}
                        label="Ton"
                      />
                      <RadioButton
                        checked={formData.tonnageUnit === 'm³'}
                        onChange={() => setFormData({ ...formData, tonnageUnit: 'm³' })}
                        label="m³"
                      />
                    </div>
                  </div>
                </div>

                {/* Vrachtprijs */}
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Vrachtprijs
                  </p>
                  <div className="flex gap-[12px] items-center">
                    <div className="bg-white border border-rdj-border-primary rounded-[8px] flex items-center overflow-hidden flex-1">
                      <div className="px-[14px] py-[10px] bg-rdj-bg-secondary border-r border-rdj-border-primary">
                        <p className="font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px]">€</p>
                      </div>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="flex-1 px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none"
                      />
                    </div>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as any })}
                      className="bg-white border border-rdj-border-primary rounded-[8px] px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                    >
                      <option>Per ton</option>
                      <option>Per m³</option>
                      <option>Blokracht</option>
                    </select>
                  </div>
                </div>
              </FormCard>

              {/* ── Card: Laden ── */}
              <FormCard title="Laden">
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Laadtijd
                  </p>
                  <input
                    type="text"
                    value={formData.loadingLocation}
                    onChange={(e) => setFormData({ ...formData, loadingLocation: e.target.value })}
                    className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                    placeholder="Uren conform Nederlands Wettelijk"
                  />
                </div>

                {/* Liggeld laden */}
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Liggeld laden
                  </p>
                  <select
                    value={formData.loadingLaytime}
                    onChange={(e) => setFormData({ ...formData, loadingLaytime: e.target.value })}
                    className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand mb-[8px]"
                  >
                    <option>Nederlands Wettelijk</option>
                    <option>Niet van toepassing</option>
                  </select>
                  <Checkbox
                    checked={formData.loadingLiggeldDuwvaak}
                    onChange={(checked) => setFormData({ ...formData, loadingLiggeldDuwvaak: checked })}
                    label="Duwvaak gelijk aan motorschepen"
                  />
                </div>
              </FormCard>

              {/* ── Card: Lossen ── */}
              <FormCard title="Lossen">
                {/* Lostijd */}
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Lostijd
                  </p>
                  <div className="mb-[12px]">
                    <Checkbox
                      checked={formData.unloadingLaytime}
                      onChange={(checked) => setFormData({ ...formData, unloadingLaytime: checked })}
                      label="Uren conform Nederlands Wettelijk"
                    />
                  </div>
                  <div className="flex gap-[12px] items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.unloadingDays}
                        onChange={(e) => setFormData({ ...formData, unloadingDays: e.target.value })}
                        className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                      />
                    </div>
                    <div className="flex gap-[8px]">
                      <RadioButton
                        checked={formData.unloadingWaitingTime === 'Uren'}
                        onChange={() => setFormData({ ...formData, unloadingWaitingTime: 'Uren' })}
                        label="Uren"
                      />
                      <RadioButton
                        checked={formData.unloadingWaitingTime === 'Dagen'}
                        onChange={() => setFormData({ ...formData, unloadingWaitingTime: 'Dagen' })}
                        label="Dagen"
                      />
                    </div>
                  </div>
                </div>

                {/* Liggeld lossen */}
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Liggeld lossen
                  </p>
                  <select
                    value={formData.unloadingLiggeld}
                    onChange={(e) => setFormData({ ...formData, unloadingLiggeld: e.target.value })}
                    className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-sans font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand mb-[8px]"
                  >
                    <option>Nederlands Wettelijk</option>
                    <option>Niet van toepassing</option>
                  </select>
                  <Checkbox
                    checked={formData.unloadingLiggeldDuwvaak}
                    onChange={(checked) => setFormData({ ...formData, unloadingLiggeldDuwvaak: checked })}
                    label="Duwvaak gelijk aan motorschepen"
                  />
                </div>
              </FormCard>

              {/* Overige condities button */}
              <Button
                variant="secondary"
                label="Overige condities"
                leadingIcon={<PlusIcon />}
                className="self-start [&_p]:!text-rdj-text-brand [&_svg_path]:!stroke-rdj-fg-brand"
              />

            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-rdj-border-secondary px-[32px] py-[16px] flex justify-end gap-[12px]">
            <Button variant="secondary" label="Annuleren" onClick={handleCancel} />
            <Button variant="primary" label="Toevoegen" onClick={handleSubmit} />
          </div>
        </div>
      </div>

      {/* Cargo Detail Sidebar */}
      <CargoDetailSidebar 
        cargoData={{
          partij: 'CRG164',
          subpartij: 'CRG164-01',
          tonnage: '2.000 t',
          ex: 'Merganser',
          exType: 'Zeeboot',
          lading: 'Houtpellets (0571)',
          subsoort: 'USA/FRAM',
          soortelijkGewicht: '0,05 t/m³',
          inhoud: '5.000 m³',
          bijzonderheden: ['KS', 'LK', 'GMP'],
          laadlocatie: 'IJmuiden Buitenspuikkanaal',
          laadlocatieCity: 'Amsterdam',
          laaddatum: 'Di 13 Jan 10:05',
          loslocatie: 'Eemhaven',
          loslocatieCity: 'Rotterdam',
          losdatum: 'Do 16 Jan 10:05',
          relatie: 'Agro Delta Groep',
          contactpersoon: 'Jaeger den Oud',
          evenaar: 'Pieter de Jong'
        }}
      />
    </div>
  );
}
