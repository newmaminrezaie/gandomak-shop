import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx"; // eager: home page must render fast

// Lazy non-home routes so the initial bundle only contains what `/` needs.
const ProductPage = lazy(() => import("./pages/ProductPage.tsx"));
const CartPage = lazy(() => import("./pages/CartPage.tsx"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const FloatingCallButton = lazy(() => import("./components/FloatingCallButton.tsx"));
const EnamadPopup = lazy(() => import("./components/EnamadPopup.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
    در حال بارگذاری…
  </div>
);

/** Mounts after the browser is idle so it never delays first paint or LCP. */
function DeferredFab() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (w.requestIdleCallback) {
      idleId = w.requestIdleCallback(() => setReady(true));
    } else {
      timeoutId = window.setTimeout(() => setReady(true), 1500);
    }
    return () => {
      if (idleId !== undefined && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <FloatingCallButton />
      <EnamadPopup />
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" dir="rtl" />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <DeferredFab />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
