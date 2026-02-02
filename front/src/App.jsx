import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import HomePage from './pages/home/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />           {/* Hero будет здесь */}
          {/* <Route path="/catalog" element={<CatalogPage />} /> */}
          {/* <Route path="/about" element={<AboutPage />} /> */}
          {/* ... остальные маршруты */}
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;