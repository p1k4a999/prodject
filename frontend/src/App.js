import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import LandingPage from "./pages/LandingPage";
import ThankYouPage from "./pages/ThankYouPage";

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
