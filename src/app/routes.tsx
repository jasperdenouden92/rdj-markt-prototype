import { createBrowserRouter, Navigate, Outlet } from "react-router";
import Bevrachting from "./pages/Bevrachting";
import Inbox from "./pages/Inbox";
import InboxVessels from "./pages/InboxVessels";
import InboxCargoDetail from "./pages/InboxCargoDetail";
import InboxVesselDetail from "./pages/InboxVesselDetail";
import LadingDetail from "./pages/LadingDetail";
import VaartuigDetail from "./pages/VaartuigDetail";
import NieuweOnderhandeling from "./pages/NieuweOnderhandeling";
import NieuwBod from "./pages/NieuwBod";
import Onderhandelingen from "./pages/Onderhandelingen";
import DatabaseAdmin from "./pages/DatabaseAdmin";
import Relaties from "./pages/Relaties";
import RelatieDetail from "./pages/RelatieDetail";
import Contracten from "./pages/Contracten";
import ContractDetail from "./pages/ContractDetail";
import Taken from "./pages/Taken";
import CrmLadingDetail from "./pages/CrmLadingDetail";
import CrmVaartuigDetail from "./pages/CrmVaartuigDetail";
import Bevrachters from "./pages/Bevrachters";
import Ladingen from "./pages/Ladingen";
import Subpartijen from "./pages/Subpartijen";
import LadingModuleDetail from "./pages/LadingModuleDetail";
import SubpartijDetail from "./pages/SubpartijDetail";
import Vloot from "./pages/Vloot";
import VlootVaartuigDetail from "./pages/VlootVaartuigDetail";

function RootLayout() {
  return <Outlet />;
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="font-sans font-bold text-[30px] text-[#101828]">404</h1>
        <p className="font-sans text-[#667085] text-[16px] mt-2">Pagina niet gevonden</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: NotFound,
    children: [
      {
        index: true,
        element: <Navigate to="/markt/bevrachting/ladingen" replace />,
      },
      {
        path: "markt/bevrachting",
        element: <Navigate to="/markt/bevrachting/ladingen" replace />,
      },
      {
        path: "markt/bevrachting/ladingen",
        Component: Bevrachting,
      },
      {
        path: "markt/bevrachting/vaartuigen",
        Component: Bevrachting,
      },
      // Bevrachting detail pages (eigen items)
      {
        path: "markt/bevrachting/lading/:id",
        Component: LadingDetail,
      },
      {
        path: "markt/bevrachting/vaartuig/:id",
        Component: VaartuigDetail,
      },
      // Inbox
      {
        path: "markt/inbox",
        element: <Navigate to="/markt/inbox/ladingen" replace />,
      },
      {
        path: "markt/inbox/ladingen",
        Component: Inbox,
      },
      {
        path: "markt/inbox/vaartuigen",
        Component: InboxVessels,
      },
      // Inbox detail pages (markt items)
      {
        path: "markt/inbox/lading/:id",
        Component: InboxCargoDetail,
      },
      {
        path: "markt/inbox/vaartuig/:id",
        Component: InboxVesselDetail,
      },
      {
        path: "markt/inbox/lading/:id/nieuweonderhandeling",
        Component: NieuweOnderhandeling,
      },
      // Bevrachting subpages
      {
        path: "markt/bevrachting/lading/:id/nieuweonderhandeling",
        Component: NieuweOnderhandeling,
      },
      {
        path: "markt/bevrachting/vaartuig/:id/nieuweonderhandeling",
        Component: NieuweOnderhandeling,
      },
      // Nieuw bod
      {
        path: "markt/onderhandelingen/:id/nieuwbod",
        Component: NieuwBod,
      },
      // Onderhandelingen
      {
        path: "markt/onderhandelingen",
        element: <Navigate to="/markt/onderhandelingen/ladingen" replace />,
      },
      {
        path: "markt/onderhandelingen/ladingen",
        Component: Onderhandelingen,
      },
      {
        path: "markt/onderhandelingen/vaartuigen",
        Component: Onderhandelingen,
      },
      // Legacy deals route redirect
      {
        path: "markt/deals",
        element: <Navigate to="/markt/onderhandelingen/ladingen" replace />,
      },
      {
        path: "markt/bevrachters",
        Component: Bevrachters,
      },
      {
        path: "markt/bevrachters/:id",
        Component: RelatieDetail,
      },
      {
        path: "markt/database",
        Component: DatabaseAdmin,
      },
      // CRM
      {
        path: "crm",
        element: <Navigate to="/crm/relaties" replace />,
      },
      {
        path: "crm/relaties",
        Component: Relaties,
      },
      {
        path: "crm/relatie/:id",
        Component: RelatieDetail,
      },
      {
        path: "vloot",
        Component: Vloot,
      },
      {
        path: "vloot/:id",
        Component: VlootVaartuigDetail,
      },
      {
        path: "lading",
        element: <Navigate to="/lading/partijen" replace />,
      },
      {
        path: "lading/partijen",
        Component: Ladingen,
      },
      {
        path: "lading/subpartijen",
        Component: Subpartijen,
      },
      {
        path: "lading/partij/:id",
        Component: LadingModuleDetail,
      },
      {
        path: "lading/subpartij/:id",
        Component: SubpartijDetail,
      },
      {
        path: "crm/taken",
        Component: Taken,
      },
      {
        path: "crm/deals",
        Component: Contracten,
      },
      {
        path: "crm/deal/:id",
        Component: ContractDetail,
      },
      {
        path: "crm/relatie/:relatieId/lading/:id",
        Component: CrmLadingDetail,
      },
      {
        path: "crm/relatie/:relatieId/vaartuig/:id",
        Component: CrmVaartuigDetail,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);