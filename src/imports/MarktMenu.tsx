import svgPaths from "./svg-80ushx2b4a";

function Content() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[8px] py-[9px] relative w-full">
          <p className="flex-[1_0_0] font-sans font-bold leading-[20px] min-h-px min-w-px relative text-[#344054] text-[14px]">Inbox</p>
        </div>
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div className="bg-[#f9fafb] flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[8px] py-[9px] relative w-full">
          <p className="flex-[1_0_0] font-sans font-bold leading-[20px] min-h-px min-w-px relative text-[#182230] text-[14px]">Bevrachting</p>
        </div>
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[8px] py-[9px] relative w-full">
          <p className="flex-[1_0_0] font-sans font-bold leading-[20px] min-h-px min-w-px relative text-[#344054] text-[14px]">Pijplijn</p>
        </div>
      </div>
    </div>
  );
}

function Content3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[8px] py-[9px] relative w-full">
          <p className="flex-[1_0_0] font-sans font-bold leading-[20px] min-h-px min-w-px relative text-[#344054] text-[14px]">Deals</p>
        </div>
      </div>
    </div>
  );
}

function MenuItems() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip py-[4px] relative shrink-0 w-full" data-name="Menu items">
      <div className="relative shrink-0 w-full" data-name="Action menu item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[4px] py-px relative w-full">
            <Content />
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-full" data-name="Action menu item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[4px] py-px relative w-full">
            <Content1 />
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-full" data-name="Action menu item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[4px] py-px relative w-full">
            <Content2 />
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-full" data-name="Action menu item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[4px] py-px relative w-full">
            <Content3 />
          </div>
        </div>
      </div>
      <div className="absolute left-[85px] size-[20px] top-[69px]" data-name="Cursor">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[16px] left-[calc(50%-1px)] top-1/2 w-[14px]" data-name="Shape">
          <div className="absolute inset-[-8.59%_-16.96%_-21.09%_-16.96%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.7499 20.75">
              <g filter="url(#filter0_d_1_16145)" id="Shape">
                <path clipRule="evenodd" d={svgPaths.pd15ef00} fill="var(--fill-0, white)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.pd15ef00} fillRule="evenodd" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
              </g>
              <defs>
                <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="20.75" id="filter0_d_1_16145" width="18.7499" x="0" y="-5.96046e-08">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0" />
                  <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_16145" />
                  <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_16145" mode="normal" result="shape" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[4px] left-[calc(50%+0.5px)] top-[calc(50%+3px)] w-[5px]" data-name="Lines">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 4">
            <path d={svgPaths.p2cc24780} fill="var(--fill-0, black)" id="Lines" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function MarktMenu() {
  return (
    <div className="bg-white relative rounded-[6px] size-full" data-name="Markt - Menu">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <MenuItems />
      </div>
      <div aria-hidden="true" className="absolute border border-[#eaecf0] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]" />
    </div>
  );
}