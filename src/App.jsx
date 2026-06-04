import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Toast from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Cameras from './pages/Cameras';
import Criteria from './pages/Criteria';
import Calculator from './pages/Calculator';
import Results from './pages/Results';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="page-container">
          <Navbar />
          <Toast />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/cameras" element={<Cameras />} />
              <Route path="/criteria" element={<Criteria />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
