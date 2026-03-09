import { RouterProvider } from "react-router";
import { Suspense } from "react";
import { router } from "./routes";

export default function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Laden...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
