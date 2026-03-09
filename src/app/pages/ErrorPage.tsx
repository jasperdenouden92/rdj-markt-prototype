import { useRouteError, Link } from "react-router";

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string };

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center p-[24px]">
        <h1 className="font-sans font-bold text-[48px] text-[#101828] mb-[16px]">
          Oops!
        </h1>
        <p className="font-sans font-normal text-[18px] text-[#475467] mb-[8px]">
          Sorry, er is een onverwachte fout opgetreden.
        </p>
        <p className="font-sans font-normal text-[14px] text-[#98a2b3] mb-[24px]">
          <i>{error?.statusText || error?.message}</i>
        </p>
        <Link
          to="/"
          className="inline-block bg-[#1567a4] text-white font-sans font-bold text-[16px] px-[20px] py-[12px] rounded-[6px]"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
