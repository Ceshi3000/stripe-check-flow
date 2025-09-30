import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/payment-success" element={
            <div>
              <div className="min-h-screen bg-payment-bg py-12 px-4">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="h-8 w-8 bg-primary rounded mr-2"></div>
                      <h1 className="text-2xl font-bold text-foreground">Cab Real Estate, LLC</h1>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg shadow-large p-8 text-center">
                    <div className="text-4xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
                    <p className="text-muted-foreground mb-6">Thank you for your payment. Your transaction has been processed successfully.</p>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
                    >
                      Return to Payment Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
