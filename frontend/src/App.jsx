import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";
import PhotoDetail from "./pages/PhotoDetail";
import Notifications from "./pages/Notifications";
import EditProfile from "./pages/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/photos/:id" element={<PhotoDetail />} />
        <Route path="/alerts" element={<Notifications />} />
        <Route path="/profile/edit" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;