import { useState } from "react";
import svgPaths from "../../imports/svg-hstiyx955m";
import Checkbox from "./Checkbox";
import SegmentedButtonGroup from "./SegmentedButtonGroup";
import TermijnDropdown, { type TermijnValue } from "./TermijnDropdown";

interface AddInboxItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  itemType: 'lading' | 'vaartuig';
}

export default function AddInboxItemModal({ isOpen, onClose, onSubmit, itemType: initialItemType }: AddInboxItemModalProps) {
  const [itemType, setItemType] = useState<'lading' | 'vaartuig'>(initialItemType);
  const [isRange, setIsRange] = useState(false);
  const [loadTerms, setLoadTerms] = useState<TermijnValue | undefined>();
  const [unloadTerms, setUnloadTerms] = useState<TermijnValue | undefined>();
  const [formData, setFormData] = useState({
    relation: '',
    contactPerson: '',
    tonnageMin: '',
    tonnageMax: '',
    cargoType: '',
    cargoSubType: '',
    specificWeight: '',
    loadPort: '',
    unloadPort: '',
    owner: '',
    priority: 1,
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ ...formData, loadTerms, unloadTerms, tonnageMax: isRange ? formData.tonnageMax : '', type: itemType });
    // Reset form
    setFormData({
      relation: '',
      contactPerson: '',
      tonnageMin: '',
      tonnageMax: '',
      cargoType: '',
      cargoSubType: '',
      specificWeight: '',
      loadPort: '',
      unloadPort: '',
      owner: '',
      priority: 1,
    });
    setLoadTerms(undefined);
    setUnloadTerms(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[128px]">
      {/* Background Overlay */}
      <div 
        className="absolute bg-[#0c111d] inset-0 opacity-70" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[12px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] w-full max-w-[640px] max-h-[90vh] overflow-auto mx-[16px]">
        {/* Header */}
        <div className="relative shrink-0 w-full">
          <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px] relative w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
              <p className="font-sans font-bold leading-[26px] relative shrink-0 text-[#101828] text-[18px] w-full">
                Nieuw item toevoegen aan inbox
              </p>
            </div>
            <button 
              onClick={onClose}
              className="overflow-clip relative shrink-0 size-[24px] hover:opacity-70"
            >
              <div className="absolute inset-[20.83%]">
                <div className="absolute inset-[-10.53%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                    <path d="M13 1L1 13M1 1L13 13" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="h-[20px] shrink-0 w-full" />

        {/* Type selector */}
        <div className="px-[24px]">
          <SegmentedButtonGroup
            items={[
              { value: 'lading', label: 'Lading' },
              { value: 'vaartuig', label: 'Vaartuig' },
            ]}
            value={itemType}
            onChange={(v) => setItemType(v as 'lading' | 'vaartuig')}
            className="w-full"
            fullWidth
          />
        </div>

        {/* Form Content */}
        <div className="px-[24px] py-[24px]">
          <div className="flex flex-col gap-[20px]">
            {/* Row 1: Relatie & Contactpersoon */}
            <div className="flex gap-[12px] w-full">
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Relatie
                </p>
                <div className="bg-white relative rounded-[6px] w-full">
                  <input
                    type="text"
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                    placeholder="Selecteer relatie..."
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Contactpersoon (optioneel)
                </p>
                <div className="bg-white relative rounded-[6px] w-full">
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                    placeholder="Selecteer contactpersoon..."
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Tonnage & Ladingsoort */}
            {itemType === 'lading' && (
              <div className="flex gap-[12px] w-full">
                <div className="flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Tonnage
                  </p>
                  <div className="flex gap-[8px] items-center">
                    <div className={`bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-[140px]`}>
                      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-[#d0d5dd]" />
                      <input
                        type="text"
                        value={formData.tonnageMin}
                        onChange={(e) => setFormData({ ...formData, tonnageMin: e.target.value })}
                        placeholder={isRange ? "Min" : "Aantal"}
                        className="flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[#101828] text-[14px] bg-transparent outline-none rounded-l-[6px] w-0"
                      />
                      <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0">
                        <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left whitespace-nowrap">t</p>
                      </div>
                    </div>
                    {isRange && (
                      <>
                        <span className="font-sans font-normal text-[#475467] text-[14px]">–</span>
                        <div className={`bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-[140px]`}>
                          <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-[#d0d5dd]" />
                          <input
                            type="text"
                            value={formData.tonnageMax}
                            onChange={(e) => setFormData({ ...formData, tonnageMax: e.target.value })}
                            placeholder="Max"
                            className="flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[#101828] text-[14px] bg-transparent outline-none rounded-l-[6px] w-0"
                          />
                          <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0">
                            <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left whitespace-nowrap">t</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <Checkbox
                    checked={isRange}
                    onChange={(checked) => setIsRange(checked)}
                    label="Range"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Ladingsoort
                  </p>
                  <div className="bg-white relative rounded-[6px] w-full">
                    <input
                      type="text"
                      value={formData.cargoType}
                      onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Bijv. Houtpellets"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Row 3: Subsoort & Soortelijk gewicht */}
            {itemType === 'lading' && (
              <div className="flex gap-[12px] w-full">
                <div className="flex-1 flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Subsoort (optioneel)
                  </p>
                  <div className="bg-white relative rounded-[6px] w-full">
                    <input
                      type="text"
                      value={formData.cargoSubType}
                      onChange={(e) => setFormData({ ...formData, cargoSubType: e.target.value })}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Bijv. Naaldhoutpellets"
                    />
                  </div>
                </div>
                <div className="w-[160px] flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Soortelijk gewicht
                  </p>
                  <div className="bg-white relative rounded-[6px] flex items-center overflow-hidden border border-[#d0d5dd]">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.specificWeight}
                      onChange={(e) => setFormData({ ...formData, specificWeight: e.target.value })}
                      className="flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none"
                      placeholder="0,05"
                    />
                    <div className="px-[12px] py-[8px] bg-[#f9fafb]">
                      <p className="font-sans font-bold leading-[20px] text-[#475467] text-[14px]">
                        ton/m³
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info label */}
            {itemType === 'lading' && formData.tonnageMin && formData.specificWeight && (
              <div className="bg-white flex gap-[4px] items-center rounded-[6px] p-[8px] border border-[#d0d5dd]">
                <div className="overflow-clip relative shrink-0 size-[16px]">
                  <div className="absolute inset-[8.33%]">
                    <div className="absolute inset-[-5%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
                        <path d={svgPaths.pbb03d00} stroke="#1567A4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="flex-1 font-sans font-normal leading-[20px] text-[#145990] text-[14px]">
                  Benodigde inhoud: {isRange && formData.tonnageMax
                    ? `${(parseFloat(formData.tonnageMin) / parseFloat(formData.specificWeight)).toFixed(0)}–${(parseFloat(formData.tonnageMax) / parseFloat(formData.specificWeight)).toFixed(0)} m³`
                    : `${(parseFloat(formData.tonnageMin) / parseFloat(formData.specificWeight)).toFixed(0)} m³`}
                </p>
              </div>
            )}

            {/* Row 4: Laadlocatie & Laadtermijn */}
            <div className="flex gap-[12px] w-full">
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  {itemType === 'lading' ? 'Laadlocatie' : 'Beschikbaar vanaf'}
                </p>
                <div className="bg-white relative rounded-[6px] w-full">
                  <input
                    type="text"
                    value={formData.loadPort}
                    onChange={(e) => setFormData({ ...formData, loadPort: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                    placeholder={itemType === 'lading' ? "Bijv. IJmuiden Buitenspuikanaal" : "Bijv. Week 12"}
                  />
                </div>
              </div>
              <div className="w-[270px] flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  {itemType === 'lading' ? 'Laadtermijn' : 'Locatie (optioneel)'}
                </p>
                {itemType === 'lading' ? (
                  <TermijnDropdown
                    value={loadTerms}
                    onChange={setLoadTerms}
                    placeholder="Selecteer termijn..."
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.loadPort}
                    onChange={(e) => setFormData({ ...formData, loadPort: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4] bg-white"
                    placeholder="Bijv. ARA gebied"
                  />
                )}
              </div>
            </div>

            {/* Row 5: Loslocatie & Lostermijn */}
            {itemType === 'lading' && (
              <div className="flex gap-[12px] w-full">
                <div className="flex-1 flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Loslocatie
                  </p>
                  <div className="bg-white relative rounded-[6px] w-full">
                    <input
                      type="text"
                      value={formData.unloadPort}
                      onChange={(e) => setFormData({ ...formData, unloadPort: e.target.value })}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Bijv. IJmuiden Buitenspuikanaal"
                    />
                  </div>
                </div>
                <div className="w-[270px] flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Lostermijn
                  </p>
                  <TermijnDropdown
                    value={unloadTerms}
                    onChange={setUnloadTerms}
                    placeholder="Selecteer termijn..."
                  />
                </div>
              </div>
            )}

            {/* Row 6: Eigenaar & Prioriteit */}
            <div className="flex gap-[12px] w-full">
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Eigenaar (optioneel)
                </p>
                <div className="bg-white relative rounded-[6px] w-full">
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                    placeholder="Selecteer eigenaar..."
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Prioriteit
                </p>
                <div className="bg-white relative rounded-[6px] w-full border border-[#d0d5dd] px-[12px] py-[8px] flex items-center gap-[8px]">
                  <div className="flex gap-[4px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFormData({ ...formData, priority: star })}
                        className="overflow-clip relative shrink-0 size-[20px]"
                      >
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                          <g clipPath="url(#clip0_1_39488)">
                            <path d={svgPaths.p2f878000} fill={star <= formData.priority ? "#FDB022" : "#F2F4F7"} />
                          </g>
                          <defs>
                            <clipPath id="clip0_1_39488">
                              <rect fill="white" height="20" width="20" />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p className="font-sans font-normal leading-[20px] text-[#101828] text-[14px]">
                    {formData.priority}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#eaecf0] px-[24px] py-[16px]">
          <div className="flex gap-[12px] justify-end">
            <button 
              onClick={onClose}
              className="bg-white relative rounded-[6px] shrink-0"
            >
              <div className="content-stretch flex items-center justify-center px-[16px] py-[10px] relative rounded-[inherit]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] whitespace-nowrap">
                  Annuleren
                </p>
              </div>
              <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-[#1567a4] relative rounded-[6px] shrink-0 hover:opacity-90"
            >
              <div className="content-stretch flex items-center justify-center px-[16px] py-[10px] relative rounded-[inherit]">
                <p className="font-sans font-bold leading-[20px] text-white text-[14px] whitespace-nowrap">
                  Item toevoegen
                </p>
              </div>
              <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
