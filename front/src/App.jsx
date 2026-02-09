// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage/MapPage';
import AdminAddProperty from './pages/admin/AdminAddProperty';
import HeroPage from './pages/homePage/HeroPage';
import Header from './components/ui/Header';
// другие страницы...

function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin/add-property" element={<AdminAddProperty />} />
        {/* <Route path="/catalog" element={<CatalogPage />} /> */}
        {/* и т.д. */}
      </Routes>
    </Router>);
}

export default App;