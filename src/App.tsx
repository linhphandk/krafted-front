import { BrowserRouter, Routes, Route } from "react-router"
import RegisterPage from "./pages/auth/RegisterPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
