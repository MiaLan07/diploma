// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage/MapPage';
import AdminAddProperty from './pages/admin/AdminAddProperty';
import Header from './components/ui/Header';
import HomePage from './pages/homePage/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import ProfilePage from './pages/profilePage/ProfilePage';
import ForgotPasswordPage from './components/common/ForgotPassword';
import ResetPasswordPage from './components/common/ResetPassword';
import PropertyDetails from './pages/propertyDetailPage/PropertyDetalis';
// другие страницы...

function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path='/auth' element={<AuthPage />} />
        <Route path='/cabinet' element={<ProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/property/:slug" element={<PropertyDetails />} />
        {/* <Route path="/catalog" element={<CatalogPage />} /> */}
        {/* и т.д. */}
      </Routes>
    </Router>);
}

export default App;