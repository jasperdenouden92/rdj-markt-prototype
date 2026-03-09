import { useNavigate, useParams } from "react-router";

interface Match {
  id: string;
  name: string;
  company: string;
  contact: string;
  location: string;
  locationDate: string;
  capacity: string;
  content: string;
  matchPercentage: string;
}

interface StartNegotiationSidebarProps {
  onClose: () => void;
  match: Match;
  offeredMatches: Set<string>;
  setOfferedMatches: (matches: Set<string>) => void;
}

export default function StartNegotiationSidebar({ 
  onClose, 
  match,
  offeredMatches,
  setOfferedMatches
}: StartNegotiationSidebarProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleStartNegotiation = () => {
    // Mark match as offered
    const newOfferedMatches = new Set(offeredMatches);
    newOfferedMatches.add(match.id);
    setOfferedMatches(newOfferedMatches);
    
    // Store in localStorage for persistence
    localStorage.setItem(`offered-matches-${id}`, JSON.stringify(Array.from(newOfferedMatches)));
    
    // Navigate to the new negotiation form with match info
    navigate(`/markt/inbox/lading/${id}/nieuweonderhandeling`, {
      state: { 
        matchName: match.name,
        matchCompany: match.company,
        matchContact: match.contact,
        matchId: match.id,
        fromInbox: true
      }
    });
  };

  return (
    <div className="w-[480px] bg-white border-l border-[#eaecf0] h-full overflow-y-auto flex-shrink-0">
      <div className="content-stretch flex flex-col size-full">
        {/* Header */}
        <div className="relative shrink-0 w-full border-b border-[#eaecf0]">
          <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px] pb-[20px] relative w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
              <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[#101828] text-[18px] w-full">
                Onderhandeling met {match.company}
              </p>
              <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#475467] text-[14px]">
                Vaartuig: {match.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="content-stretch flex items-center justify-center overflow-clip p-[8px] relative rounded-[6px] shrink-0 size-[36px] hover:bg-rdj-bg-primary-hover"
            >
              <div className="overflow-clip relative shrink-0 size-[20px]">
                <div className="absolute inset-[29.17%]">
                  <div className="absolute inset-[-10%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
                      <path d="M9 1L1 9M1 1L9 9" stroke="#98A2B3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-[24px] py-[40px]">
          <div className="flex flex-col items-center gap-[24px] max-w-[320px]">
            {/* Icon */}
            <div className="bg-[#e3effb] relative rounded-[9999px] shrink-0 size-[56px] flex items-center justify-center">
              <div className="overflow-clip relative shrink-0 size-[28px]">
                <div className="absolute inset-[12.5%_8.33%]">
                  <div className="absolute inset-[-5.56%_-5%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 20">
                      <path d="M21 9.32001C21.0037 10.5733 20.7626 11.8148 20.2901 12.973C19.8176 14.1312 19.123 15.1831 18.2474 16.0689C17.3718 16.9547 16.3325 17.6577 15.1892 18.1392C14.046 18.6208 12.8204 18.8717 11.5804 18.878C9.20025 18.8772 6.91715 17.9301 5.25043 16.251L1.00043 20.5V11.5H9.50043L5.25043 15.75C6.62476 17.1384 8.54418 17.9143 10.5479 17.8957C12.5517 17.8771 14.4561 17.0653 15.8025 15.6497C17.1489 14.2341 17.8283 12.3346 17.6892 10.3979C17.5502 8.46109 16.6049 6.66772 15.0646 5.44961C13.5243 4.23149 11.5188 3.69569 9.54418 3.97063C7.5696 4.24556 5.80052 5.3053 4.64043 6.91501M11.0004 5V11L16.0004 13.5" stroke="#1567A4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-[8px] items-center">
              <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[28px] text-center text-[#101828] text-[18px]">
                Start een onderhandeling
              </p>
              <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-center text-[#475467] text-[14px]">
                Begin een onderhandeling met {match.company} voor het vaartuig {match.name}. Je kunt hier een bod doen.
              </p>
            </div>

            {/* Button */}
            <button 
              onClick={handleStartNegotiation}
              className="bg-[#1567a4] w-full relative rounded-[6px] hover:opacity-90"
            >
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center justify-center px-[18px] py-[10px] relative w-full">
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-white text-[14px] whitespace-nowrap">
                    Start onderhandeling
                  </p>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}