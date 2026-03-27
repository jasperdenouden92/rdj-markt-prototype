import { RouterProvider } from "react-router";
import { Suspense } from "react";
import { router } from "./routes";
import { TooltipProvider } from "./components/ui/tooltip";

export default function App() {
  return (
    <TooltipProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Laden...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </TooltipProvider>
  );
}
