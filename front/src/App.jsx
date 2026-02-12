// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage/MapPage';
import AdminAddProperty from './pages/admin/AdminAddProperty';
import Header from './components/ui/Header';
import HomePage from './pages/homePage/HomePage';
// другие страницы...

function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin/add-property" element={<AdminAddProperty />} />
        {/* <Route path="/catalog" element={<CatalogPage />} /> */}
        {/* и т.д. */}
      </Routes>
    </Router>);
}

export default App;