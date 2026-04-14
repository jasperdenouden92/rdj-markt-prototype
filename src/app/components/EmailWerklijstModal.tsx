import { useState } from "react";
import svgPaths from "../../imports/svg-8gg4gps3bu";
import Checkbox from "./Checkbox";
import RadioButton from "./RadioButton";

interface EmailWerklijstModalProps {
  onClose: () => void;
  onSend: () => void;
}

// Mock data for standaard bevrachters
const STANDAARD_BEVRACHTERS = [
  "bevrachting@rederij.nl",
  "bevrachter@waterman.nl",
  "info@scheepvaart.nl",
  "contact@vaartuigen.nl",
];

// Mock data for standaard lading-eigenaren
const STANDAARD_LADING_EIGENAREN = [
  "planning@bouwbedrijf.nl",
  "logistiek@grondwerk.nl",
  "info@waterbouw.nl",
];

export default function EmailWerklijstModal({ onClose, onSend }: EmailWerklijstModalProps) {
  const [status, setStatus] = useState<'werklijst-en-markt' | 'alleen-werklijst'>('werklijst-en-markt');
  const [content, setContent] = useState<'lading-en-vaartuigen' | 'alleen-lading' | 'alleen-vaartuigen'>('alleen-vaartuigen');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [sender] = useState("bevrachtingen@rederijdejong.nl");
  const [subject] = useState("Beschikbare schepen");
  const [message] = useState(`Goedendag,

Zie bijgevoegd beschikbare vaartuigen van dinsdag 27 januari. Mocht u passende ladingen hebben, neem contact op met bevrachtingen@rederijdejong.nl of bel +31 (0)10-2311510.`);
  const [anonymizeVessels, setAnonymizeVessels] = useState(true);

  const handleSend = () => {
    // Only proceed if recipients are selected
    if (recipients.length === 0) {
      return;
    }
    onSend();
    onClose();
  };

  const addStandaardBevrachters = () => {
    const newRecipients = [...recipients];
    STANDAARD_BEVRACHTERS.forEach(email => {
      if (!newRecipients.includes(email)) {
        newRecipients.push(email);
      }
    });
    setRecipients(newRecipients);
  };

  const addStandaardOpdrachtgevers = () => {
    const newRecipients = [...recipients];
    STANDAARD_LADING_EIGENAREN.forEach(email => {
      if (!newRecipients.includes(email)) {
        newRecipients.push(email);
      }
    });
    setRecipients(newRecipients);
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const clearAllRecipients = () => {
    setRecipients([]);
  };

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-[#0c111d] opacity-70 z-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[10px] max-w-[600px] w-full max-h-[90vh] overflow-auto shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
          {/* Header */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px] relative w-full">
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
                <p className="font-sans font-bold leading-[26px] relative shrink-0 text-[#101828] text-[18px] w-full">
                  Werklijst e-mailen
                </p>
                <p className="font-sans font-normal leading-[20px] relative shrink-0 text-[#475467] text-[14px] w-full">
                  Selecteer wat je van de bevrachting wilt e-mailen en naar wie.
                </p>
              </div>
              <button onClick={onClose} className="absolute content-stretch flex items-center justify-center overflow-clip p-[8px] right-[12px] rounded-[6px] size-[44px] top-[12px]">
                <div className="overflow-clip relative shrink-0 size-[24px]">
                  <div className="absolute inset-1/4">
                    <div className="absolute inset-[-8.33%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                        <path d="M13 1L1 13M1 1L13 13" stroke="#98A2B3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            <div className="h-[20px] shrink-0 w-full" />
            <div className="h-px relative shrink-0 w-full bg-[#eaecf0]" />
          </div>

          {/* Content */}
          <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
            {/* Status */}
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Status</p>
              <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
                <RadioButton
                  checked={status === 'werklijst-en-markt'}
                  onChange={() => setStatus('werklijst-en-markt')}
                  label="Werklijst en reeds in de markt"
                />
                <RadioButton
                  checked={status === 'alleen-werklijst'}
                  onChange={() => setStatus('alleen-werklijst')}
                  label="Alleen werklijst"
                />
              </div>
            </div>

            {/* Inhoud */}
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Inhoud</p>
              <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
                <RadioButton
                  checked={content === 'lading-en-vaartuigen'}
                  onChange={() => setContent('lading-en-vaartuigen')}
                  label="Lading en vaartuigen"
                />
                <RadioButton
                  checked={content === 'alleen-lading'}
                  onChange={() => setContent('alleen-lading')}
                  label="Alleen lading"
                />
                <RadioButton
                  checked={content === 'alleen-vaartuigen'}
                  onChange={() => setContent('alleen-vaartuigen')}
                  label="Alleen vaartuigen"
                />
              </div>
            </div>

            {/* Ontvangers */}
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
                  <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Ontvangers</p>
                </div>
                <div className="content-stretch flex gap-[12px] items-center shrink-0">
                  <button className="content-stretch flex gap-[6px] items-center justify-center overflow-clip relative shrink-0" onClick={addStandaardBevrachters}>
                    <div className="overflow-clip relative shrink-0 size-[20px]">
                      <div className="absolute inset-[20.83%]">
                        <div className="absolute inset-[-7.14%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
                            <path d={svgPaths.p1b67fa00} stroke="#145990" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#145990] text-[14px] whitespace-nowrap">Standaard bevrachters</p>
                  </button>
                  <button className="content-stretch flex gap-[6px] items-center justify-center overflow-clip relative shrink-0" onClick={addStandaardOpdrachtgevers}>
                    <div className="overflow-clip relative shrink-0 size-[20px]">
                      <div className="absolute inset-[20.83%]">
                        <div className="absolute inset-[-7.14%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
                            <path d={svgPaths.p1b67fa00} stroke="#145990" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#145990] text-[14px] whitespace-nowrap">Standaard lading-eigenaren</p>
                  </button>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                {recipients.length > 0 ? (
                  <div className="bg-white relative rounded-[6px] shrink-0 w-full">
                    <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                      <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
                        <div className="content-center flex flex-[1_0_0] flex-wrap gap-[6px] items-center min-h-px min-w-px relative">
                          {recipients.map(email => (
                            <div key={email} className="bg-white content-stretch flex gap-[3px] items-center justify-center pl-[9px] pr-[4px] py-[2px] relative rounded-[4px] shrink-0">
                              <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[4px]" />
                              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-center whitespace-nowrap">{email}</p>
                              <button onClick={() => removeRecipient(email)} className="content-stretch flex flex-col items-start overflow-clip p-[2px] relative rounded-[3px] shrink-0">
                                <div className="overflow-clip relative shrink-0 size-[12px]">
                                  <div className="absolute inset-1/4">
                                    <div className="absolute inset-[-12.5%]">
                                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.5 7.5">
                                        <path d={svgPaths.p2418cd00} stroke="#98A2B3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                        {recipients.length > 0 && (
                          <button onClick={clearAllRecipients} className="overflow-clip relative shrink-0 size-[16px]">
                            <div className="absolute inset-1/4">
                              <div className="absolute inset-[-9.38%]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.5 9.5">
                                  <path d={svgPaths.p1ddb9c00} stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                    <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                  </div>
                ) : (
                  <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                    <div className="bg-white relative rounded-[6px] shrink-0 w-full border-[#fda29b]">
                      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex items-center px-[12px] py-[8px] relative w-full">
                          <p className="flex-1 font-sans font-normal leading-[20px] text-[#667085] text-[14px] outline-none">
                            Selecteer relaties...
                          </p>
                        </div>
                      </div>
                      <div aria-hidden="true" className="absolute border border-[#fda29b] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                    </div>
                    <p className="font-sans font-normal leading-[20px] relative shrink-0 text-[#d92d20] text-[14px] text-left w-full">
                      Selecteer ten minste 1 relatie.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Afzender */}
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-left whitespace-nowrap">Afzender</p>
              <div className="bg-white relative rounded-[6px] shrink-0 w-full">
                <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex gap-[8px] items-center px-[14px] py-[10px] relative w-full">
                    <p className="flex-1 font-sans font-normal leading-[20px] text-[#101828] text-[14px] text-left whitespace-nowrap">{sender}</p>
                    <div className="overflow-clip relative shrink-0 size-[20px]">
                      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]">
                        <div className="absolute inset-[-16.67%_-8.33%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                            <path d={svgPaths.p1b1fa300} stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </div>
            </div>

            {/* Onderwerp */}
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-left whitespace-nowrap">Onderwerp</p>
              <div className="bg-white relative rounded-[6px] shrink-0 w-full">
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex gap-[8px] items-center px-[14px] py-[10px] relative w-full">
                    <p className="flex-1 font-sans font-normal leading-[20px] text-[#101828] text-[14px] text-ellipsis text-left whitespace-nowrap">{subject}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Begeleidende e-mail */}
            <div className="content-stretch flex flex-col gap-[6px] h-[180px] items-start relative shrink-0 w-full">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-left whitespace-nowrap">Begeleidende e-mail</p>
              <div className="bg-white flex-[1_0_0] relative rounded-[6px] w-full">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex items-start px-[14px] py-[12px] relative size-full">
                    <p className="flex-[1_0_0] font-sans font-normal h-full leading-[20px] text-[#101828] text-[14px] text-left whitespace-pre-wrap">
                      {message}
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </div>
              <p className="font-sans font-normal leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left w-full">
                De e-mail bevat automatisch een afbeelding en PDF van de geëxporteerde werklijst.
              </p>
            </div>

            {/* Vaartuigen anonimiseren */}
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
              <Checkbox
                checked={anonymizeVessels}
                onChange={(val) => setAnonymizeVessels(val)}
                label="Vaartuigen anonimiseren"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="h-px relative shrink-0 w-full bg-[#eaecf0]" />
          <div className="flex flex-row items-center justify-end size-full">
            <div className="content-stretch flex gap-[12px] items-center justify-end pb-[24px] px-[24px] relative w-full">
              <button
                onClick={onClose}
                className="bg-white relative rounded-[6px] shrink-0"
              >
                <div className="content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
                  <p className="font-sans font-bold leading-[24px] relative shrink-0 text-[#344054] text-[16px] whitespace-nowrap">Annuleren</p>
                </div>
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </button>
              <button
                onClick={handleSend}
                disabled={recipients.length === 0}
                className={`bg-[#1567a4] relative rounded-[6px] shrink-0 ${recipients.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
                  <p className="font-sans font-bold leading-[24px] relative shrink-0 text-[16px] text-white whitespace-nowrap">Verzenden</p>
                </div>
                <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}