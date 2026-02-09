// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage/MapPage';
import AdminAddProperty from './pages/admin/AdminAddProperty';
import HeroPage from './pages/homePage/HeroPage';
// другие страницы...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Главная страница (добавьте потом) <HeroPage /></div>} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin/add-property" element={<AdminAddProperty />} />
        {/* <Route path="/catalog" element={<CatalogPage />} /> */}
        {/* и т.д. */}
      </Routes>
    </Router>
  );
}

export default App;