import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import RequireAuth from "./components/RequireAuth"
import Layout from "./components/Layout"
import RegisterPage from "./pages/auth/RegisterPage"
import LoginPage from "./pages/auth/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import CreateListingPage from "./pages/listings/CreateListingPage"
import ListingDetailPage from "./pages/listings/ListingDetailPage"

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/listings/new" element={<CreateListingPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
