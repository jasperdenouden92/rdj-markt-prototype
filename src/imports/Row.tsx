function Row1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full" data-name="Row">
      <div className="flex flex-[1_0_0] flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#475467] text-[12px] text-ellipsis whitespace-nowrap">
        <p className="leading-[18px] overflow-hidden">Frits van Dam</p>
      </div>
    </div>
  );
}

function TitleAndSubtitle() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center min-h-px min-w-px relative" data-name="Title and subtitle">
      <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[14px] text-black whitespace-nowrap">Alpha Barging Rotterdam B.V.</p>
      <Row1 />
    </div>
  );
}

function TopRow() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Top row">
      <TitleAndSubtitle />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
      <TopRow />
    </div>
  );
}

function CheckboxGroupItem() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 w-full" data-name="Checkbox group item">
      <div aria-hidden="true" className="absolute border border-[#eaecf0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="content-stretch flex items-start p-[16px] relative w-full">
        <Content />
      </div>
    </div>
  );
}

function InputBoxGekozen() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative" data-name="Input box (gekozen)">
      <CheckboxGroupItem />
    </div>
  );
}

export default function Row() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative size-full" data-name="Row">
      <InputBoxGekozen />
    </div>
  );
}