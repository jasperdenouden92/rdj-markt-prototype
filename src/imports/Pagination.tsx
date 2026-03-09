import svgPaths from "./svg-97w2qbrm42";

export default function Pagination() {
  return (
    <div className="content-stretch flex items-center justify-between px-[24px] py-[20px] relative size-full" data-name="Pagination">
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Amount">
        <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Regels per pagina</p>
        <button className="content-stretch cursor-pointer flex flex-col gap-[8px] items-start relative shrink-0 w-[80px]" data-name="Input dropdown">
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
            <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="Input">
              <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
                  <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
                    <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#101828] text-[14px] text-left whitespace-nowrap">50</p>
                  </div>
                  <div className="overflow-clip relative shrink-0 size-[20px]" data-name="chevron-down">
                    <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Icon">
                      <div className="absolute inset-[-16.67%_-8.33%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                          <path d={svgPaths.p1b1fa300} id="Icon" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
            </div>
          </div>
        </button>
      </div>
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Navigation">
        <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#344054] text-[0px] text-[14px] whitespace-nowrap">
          <span className="leading-[20px]">1</span>
          <span className="leading-[20px]">{` tot 5`}</span>
          <span className="leading-[20px]">0</span>
          <span className="leading-[20px]">{` van `}</span>
          <span className="leading-[20px]">2.000</span>
        </p>
        <div className="content-stretch flex h-[20px] items-center relative shrink-0" data-name="Button wrap">
          <div className="content-stretch flex items-center justify-center overflow-clip p-[8px] relative rounded-[6px] shrink-0" data-name="Buttons/Button">
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="arrow-left">
              <div className="absolute inset-[20.83%]" data-name="Icon">
                <div className="absolute inset-[-7.14%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
                    <path d={svgPaths.p3ba8b580} id="Icon" stroke="var(--stroke-0, #475467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Page dropdown">
          <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Pagina</p>
          <button className="content-stretch cursor-pointer flex flex-col gap-[8px] items-start relative shrink-0 w-[64px]" data-name="Input dropdown">
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
              <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="Input">
                <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
                    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
                      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#101828] text-[14px] text-left whitespace-nowrap">1</p>
                    </div>
                    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="chevron-down">
                      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Icon">
                        <div className="absolute inset-[-16.67%_-8.33%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                            <path d={svgPaths.p1b1fa300} id="Icon" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </div>
            </div>
          </button>
          <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">van 10</p>
        </div>
        <div className="content-stretch flex h-[20px] items-center justify-end relative shrink-0" data-name="Button wrap">
          <div className="content-stretch flex items-center justify-center overflow-clip p-[8px] relative rounded-[6px] shrink-0" data-name="Buttons/Button">
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="arrow-right">
              <div className="absolute inset-[20.83%]" data-name="Icon">
                <div className="absolute inset-[-7.14%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
                    <path d={svgPaths.p19aed710} id="Icon" stroke="var(--stroke-0, #475467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}