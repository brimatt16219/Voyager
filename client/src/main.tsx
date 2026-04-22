import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";
import "./index.css";

const Home    = lazy(() => import("./pages/Home"));
const AppPage = lazy(() => import("./pages/AppPage"));

const queryClient = new QueryClient();

function PageSkeleton() {
  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Space Mono', monospace", fontSize: 12,
      letterSpacing: "0.14em", color: "#3a3a50",
    }}>
      LOADING…
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      resetKeys={[location.pathname]}
    >
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/"    element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/app" element={<PageWrapper><AppPage /></PageWrapper>} />
          <Route path="*"    element={<Navigate to="/" replace />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);