import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Home from "./pages/Home";
import AppPage from "./pages/AppPage";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);