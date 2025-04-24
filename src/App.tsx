// src/App.tsx
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import GameDetails from "@/pages/GameDetails";
import AddGame from "@/pages/AddGame";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import GamesModeration from "@/pages/admin/GamesModeration";
import ReviewsModeration from "@/pages/admin/ReviewsModeration";
import Users from "@/pages/admin/Users";
import Analytics from "@/pages/admin/Analytics";
import Settings from "@/pages/admin/Settings";
import Profile from "@/pages/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/games/:id" element={<GameDetails />} />

                    {/* Authenticated Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/add-game" element={<AddGame />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute requireAdmin={true} />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="games" element={<GamesModeration />} />
                        <Route path="reviews" element={<ReviewsModeration />} />
                        <Route path="users" element={<Users />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <footer className="py-6 border-t text-center">
                  © 2025 Games Review Board
                </footer>
              </div>
              <Sonner position="top-right" />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
