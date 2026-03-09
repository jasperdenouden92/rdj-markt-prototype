import svgPaths from "./svg-08ubf28gdz";

function BackgroundOverlay() {
  return <div className="absolute bg-[#0c111d] inset-0 opacity-70" data-name="Background overlay" />;
}

function TextAndSupportingText() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative" data-name="Text and supporting text">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[#101828] text-[18px] w-full">Bepaal de condities voor HBT171-01</p>
      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#475467] text-[14px] w-full">
        <span className="leading-[20px]">{`2.000 ton Houtpellets van `}</span>
        <span className="leading-[20px]">Salzgitter Stichkanal</span>
        <span className="leading-[20px]">{` naar `}</span>
        <span className="leading-[20px]">Hamburg Veddelkanal</span>
      </p>
    </div>
  );
}

function Content() {
  return (
    <div className="relative shrink-0 w-full" data-name="Content">
      <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px] relative w-full">
        <TextAndSupportingText />
      </div>
    </div>
  );
}

function PaddingBottom() {
  return <div className="h-[20px] shrink-0 w-full" data-name="Padding bottom" />;
}

function TextInput() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-bl-[6px] rounded-tl-[6px] self-stretch" data-name="Text input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
          <p className="flex-[1_0_0] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px overflow-hidden relative text-[#101828] text-[14px] text-ellipsis text-left whitespace-nowrap">1000</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-bl-[6px] rounded-tl-[6px]" />
    </div>
  );
}

function AddOn() {
  return (
    <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-bl-[8px] rounded-tl-[8px] shrink-0" data-name="Add-on">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left whitespace-nowrap">t</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      <TextInput />
      <AddOn />
    </div>
  );
}

function InputWithLabel() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-left whitespace-nowrap">Tonnage</p>
      <Input />
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[16px] items-end relative shrink-0 w-[224px]" data-name="Row">
      <button className="content-stretch cursor-pointer flex flex-col gap-[6px] items-start relative shrink-0 w-[160px]" data-name="Input field">
        <InputWithLabel />
      </button>
      <div className="flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal h-[36px] justify-center leading-[0] relative shrink-0 text-[#475467] text-[0px] w-[316px]">
        <p className="text-[12px]">
          <span className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[18px]">50%</span>
          <span className="leading-[18px]">{` van deze lading wordt naar de werklijst gezet`}</span>
        </p>
      </div>
    </div>
  );
}

function AddOn1() {
  return (
    <div className="content-stretch flex items-center pl-[14px] pr-[12px] py-[10px] relative rounded-bl-[8px] rounded-tl-[8px] shrink-0" data-name="Add-on">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left whitespace-nowrap">€</p>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-br-[6px] rounded-tr-[6px] self-stretch" data-name="Text input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] py-[10px] relative size-full">
          <p className="flex-[1_0_0] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px overflow-hidden relative text-[#101828] text-[14px] text-ellipsis text-left whitespace-nowrap">4,00</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-br-[6px] rounded-tr-[6px]" />
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      <AddOn1 />
      <TextInput1 />
    </div>
  );
}

function InputWithLabel1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-left whitespace-nowrap">Vrachtprijs</p>
      <Input1 />
    </div>
  );
}

function Check() {
  return <div className="absolute bg-white inset-[31.25%] rounded-[9999px]" data-name="Check" />;
}

function Input2() {
  return (
    <div className="content-stretch flex items-center justify-center pt-[2px] relative shrink-0" data-name="Input">
      <div className="bg-[#1567a4] overflow-clip relative rounded-[9999px] shrink-0 size-[16px]" data-name="_Checkbox base">
        <Check />
      </div>
    </div>
  );
}

function TextAndSupportingText1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Per ton</p>
    </div>
  );
}

function Input3() {
  return (
    <div className="content-stretch flex items-center justify-center pt-[2px] relative shrink-0" data-name="Input">
      <div className="relative rounded-[9999px] shrink-0 size-[16px]" data-name="_Checkbox base">
        <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function TextAndSupportingText2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Per m³</p>
    </div>
  );
}

function Input4() {
  return (
    <div className="content-stretch flex items-center justify-center pt-[2px] relative shrink-0" data-name="Input">
      <div className="relative rounded-[9999px] shrink-0 size-[16px]" data-name="_Checkbox base">
        <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function TextAndSupportingText3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Blokvracht</p>
    </div>
  );
}

function List() {
  return (
    <div className="relative self-stretch shrink-0 w-[512px]" data-name="List">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex gap-[16px] items-end py-[10px] relative size-full">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Checkbox">
            <Input2 />
            <TextAndSupportingText1 />
          </div>
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Checkbox">
            <Input3 />
            <TextAndSupportingText2 />
          </div>
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Checkbox">
            <Input4 />
            <TextAndSupportingText3 />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Row">
      <button className="content-stretch cursor-pointer flex flex-col gap-[6px] items-start relative shrink-0 w-[160px]" data-name="Input field">
        <InputWithLabel1 />
      </button>
      <List />
    </div>
  );
}

function Section() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Section">
      <Row1 />
    </div>
  );
}

function InputWithLabel2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Input with label">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Laadtijd</p>
    </div>
  );
}

function InputDropdown1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Input dropdown">
      <InputWithLabel2 />
    </div>
  );
}

function Input5() {
  return (
    <div className="content-stretch flex items-center justify-center pt-[2px] relative shrink-0" data-name="Input">
      <div className="relative rounded-[4px] shrink-0 size-[16px]" data-name="_Checkbox base">
        <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[4px]" />
      </div>
    </div>
  );
}

function TextAndSupportingText4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Conform Nederlands Wettelijk</p>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="List">
      <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Checkbox">
        <Input5 />
        <TextAndSupportingText4 />
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[150.25px]" data-name="Content">
      <p className="flex-[1_0_0] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px overflow-hidden relative text-[#667085] text-[14px] text-ellipsis whitespace-nowrap">0</p>
    </div>
  );
}

function Input6() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 w-[80px]" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      <Content2 />
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#101828] text-[14px] text-left whitespace-nowrap">uur</p>
    </div>
  );
}

function Input7() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
          <Content3 />
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
  );
}

function InputWithLabel3() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <Input7 />
    </div>
  );
}

function Inputs1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="Inputs">
      <Input6 />
      <button className="content-stretch cursor-pointer flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
        <InputWithLabel3 />
      </button>
    </div>
  );
}

function Inputs() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Inputs">
      <List1 />
      <Inputs1 />
    </div>
  );
}

function InputDropdown() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
      <InputDropdown1 />
      <Inputs />
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px relative" data-name="Row">
      <InputDropdown />
    </div>
  );
}

function InputWithLabel4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Input with label">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Lostijd</p>
    </div>
  );
}

function InputDropdown3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Input dropdown">
      <InputWithLabel4 />
    </div>
  );
}

function Input8() {
  return (
    <div className="content-stretch flex items-center justify-center pt-[2px] relative shrink-0" data-name="Input">
      <div className="bg-[#1567a4] overflow-clip relative rounded-[4px] shrink-0 size-[16px]" data-name="_Checkbox base">
        <div className="absolute inset-[12.5%] overflow-clip" data-name="check">
          <div className="absolute bottom-[29.17%] left-[16.67%] right-[16.67%] top-1/4" data-name="Icon">
            <div className="absolute inset-[-15.15%_-10.42%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.6666 7.1666">
                <path d={svgPaths.p38f57cf0} id="Icon" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6666" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Conform Nederlands Wettelijk</p>
    </div>
  );
}

function List2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="List">
      <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Checkbox">
        <Input8 />
        <TextAndSupportingText5 />
      </div>
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[150.25px]" data-name="Content">
      <p className="flex-[1_0_0] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px overflow-hidden relative text-[#667085] text-[14px] text-ellipsis whitespace-nowrap">0</p>
    </div>
  );
}

function Input9() {
  return (
    <div className="bg-[#f9fafb] content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 w-[80px]" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      <Content4 />
    </div>
  );
}

function Content5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="flex-[1_0_0] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px overflow-hidden relative text-[#667085] text-[14px] text-ellipsis text-left whitespace-nowrap">uur</p>
    </div>
  );
}

function Input10() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
          <Content5 />
          <div className="overflow-clip relative shrink-0 size-[20px]" data-name="chevron-down">
            <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Icon">
              <div className="absolute inset-[-16.67%_-8.33%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                  <path d={svgPaths.p1b1fa300} id="Icon" stroke="var(--stroke-0, #98A2B3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
    </div>
  );
}

function InputWithLabel5() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <Input10 />
    </div>
  );
}

function Inputs3() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="Inputs">
      <Input9 />
      <button className="content-stretch cursor-pointer flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
        <InputWithLabel5 />
      </button>
    </div>
  );
}

function Inputs2() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Inputs">
      <List2 />
      <Inputs3 />
    </div>
  );
}

function InputDropdown2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
      <InputDropdown3 />
      <Inputs2 />
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Row">
      <InputDropdown2 />
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Row">
      <Row5 />
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full" data-name="Row">
      <Row3 />
      <Row4 />
    </div>
  );
}

function InputWithLabel6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Input with label">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Liggeld laden</p>
    </div>
  );
}

function InputDropdown5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Input dropdown">
      <InputWithLabel6 />
    </div>
  );
}

function Content6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#101828] text-[14px] text-left whitespace-nowrap">Niet van toepassing</p>
    </div>
  );
}

function Input11() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
          <Content6 />
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
  );
}

function InputWithLabel7() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <Input11 />
    </div>
  );
}

function Inputs5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Inputs">
      <button className="content-stretch cursor-pointer flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
        <InputWithLabel7 />
      </button>
    </div>
  );
}

function Inputs4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Inputs">
      <Inputs5 />
    </div>
  );
}

function InputDropdown4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
      <InputDropdown5 />
      <Inputs4 />
    </div>
  );
}

function InputWithLabel8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Input with label">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Liggeld lossen</p>
    </div>
  );
}

function InputDropdown7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Input dropdown">
      <InputWithLabel8 />
    </div>
  );
}

function Content7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#101828] text-[14px] text-left whitespace-nowrap">Niet van toepassing</p>
    </div>
  );
}

function Input12() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
          <Content7 />
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
  );
}

function InputWithLabel9() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <Input12 />
    </div>
  );
}

function Inputs7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Inputs">
      <button className="content-stretch cursor-pointer flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
        <InputWithLabel9 />
      </button>
    </div>
  );
}

function Inputs6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Inputs">
      <Inputs7 />
    </div>
  );
}

function InputDropdown6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Input dropdown">
      <InputDropdown7 />
      <Inputs6 />
    </div>
  );
}

function Row10() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Row">
      <InputDropdown6 />
    </div>
  );
}

function Row9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Row">
      <Row10 />
    </div>
  );
}

function Row8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px relative self-stretch" data-name="Row">
      <Row9 />
    </div>
  );
}

function Row7() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full" data-name="Row">
      <InputDropdown4 />
      <Row8 />
    </div>
  );
}

function Row6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Row">
      <Row7 />
    </div>
  );
}

function Input13() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[6px] w-full" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start px-[14px] py-[12px] relative size-full">
          <p className="flex-[1_0_0] font-['Hanken_Grotesk:Regular',sans-serif] font-normal h-full leading-[20px] min-h-px min-w-px relative text-[#667085] text-[14px] text-left">Extra informatie en bijzonderheden...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
    </div>
  );
}

function InputWithLabel10() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-[154px] items-start relative shrink-0 w-full" data-name="Input with label">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-left whitespace-nowrap">Opmerkingen</p>
      <Input13 />
    </div>
  );
}

function Content1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Content">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
        <Row />
        <Section />
        <Row2 />
        <Row6 />
        <button className="content-stretch cursor-pointer flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Textarea input field">
          <InputWithLabel10 />
        </button>
      </div>
    </div>
  );
}

function DividerWrap() {
  return (
    <div className="h-[25px] relative shrink-0 w-full" data-name="Divider-wrap">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 600 25">
        <g id="Divider-wrap">
          <path clipRule="evenodd" d="M600 1H0V0H600V1Z" fill="var(--fill-0, #EAECF0)" fillRule="evenodd" id="Divider" />
        </g>
      </svg>
    </div>
  );
}

function TextPadding() {
  return (
    <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0" data-name="Text padding">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[24px] relative shrink-0 text-[#344054] text-[16px] whitespace-nowrap">Annuleren</p>
    </div>
  );
}

function TextPadding1() {
  return (
    <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0" data-name="Text padding">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[24px] relative shrink-0 text-[16px] text-white whitespace-nowrap">Toepassen</p>
    </div>
  );
}

function Actions() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center justify-end min-h-px min-w-px relative" data-name="Actions">
      <div className="bg-white relative rounded-[6px] shrink-0" data-name="Buttons/Button">
        <div className="content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
          <TextPadding />
        </div>
        <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      </div>
      <div className="bg-[#1567a4] relative rounded-[6px] shrink-0" data-name="Buttons/Button">
        <div className="content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
          <TextPadding1 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      </div>
    </div>
  );
}

function Content8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-end pb-[24px] px-[24px] relative w-full">
          <Actions />
        </div>
      </div>
    </div>
  );
}

function Modal() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center overflow-clip relative rounded-[10px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] shrink-0 w-[600px]" data-name="Modal">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="_Modal header">
        <Content />
        <div className="absolute content-stretch flex items-center justify-center overflow-clip p-[8px] right-[12px] rounded-[6px] size-[44px] top-[12px]" data-name="Button close X">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-name="x-close">
            <div className="absolute inset-1/4" data-name="Icon">
              <div className="absolute inset-[-8.33%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                  <path d="M13 1L1 13M1 1L13 13" id="Icon" stroke="var(--stroke-0, #98A2B3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <PaddingBottom />
        <div className="h-px relative shrink-0 w-full" data-name="Divider">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 600 1">
            <path clipRule="evenodd" d="M600 1H0V0H600V1Z" fill="var(--fill-0, #EAECF0)" fillRule="evenodd" id="Divider" />
          </svg>
        </div>
      </div>
      <Content1 />
      <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="_Modal actions">
        <DividerWrap />
        <Content8 />
      </div>
    </div>
  );
}

export default function MarktBevrachtingLadingNaarWerklijst() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center px-[24px] py-[32px] relative size-full" data-name="Markt - Bevrachting - Lading naar werklijst">
      <div className="absolute h-[2190px] left-0 top-0 w-[1920px]" data-name="Background overlay">
        <BackgroundOverlay />
      </div>
      <Modal />
    </div>
  );
}