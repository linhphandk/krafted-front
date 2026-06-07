import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router"
import ErrorBoundary from "./components/ErrorBoundary"
import RequireAuth from "./components/RequireAuth"
import Layout from "./components/Layout"
import RegisterPage from "./pages/auth/RegisterPage"
import LoginPage from "./pages/auth/LoginPage"
import ProfilePage from "./pages/auth/ProfilePage"
import DashboardPage from "./pages/DashboardPage"
import CreateListingPage from "./pages/listings/CreateListingPage"
import EditListingPage from "./pages/listings/EditListingPage"
import MyListingsPage from "./pages/listings/MyListingsPage"
import ListingDetailPage from "./pages/listings/ListingDetailPage"
import ListingsPage from "./pages/listings/ListingsPage"
import FavoritesPage from "./pages/FavoritesPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            element={
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/mine" element={<MyListingsPage />} />
            <Route path="/listings/new" element={<CreateListingPage />} />
            <Route path="/listings/:id/edit" element={<EditListingPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
