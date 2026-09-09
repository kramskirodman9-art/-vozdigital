import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TeacherProvider } from "./contexts/TeacherContext";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import SectionPage from "./pages/SectionPage";
import Birthdays from "./pages/Birthdays";
import History from "./pages/History";
import TeacherLogin from "./pages/TeacherLogin";
import Polls from "./pages/Polls";
import Merits from "./pages/Merits";
import Calendar from "./pages/Calendar";
import Gallery from "./pages/Gallery";
import AskDirector from "./pages/AskDirector";
import DailyChallenge from "./pages/DailyChallenge";
import Chat from "./pages/Chat";
import StudyGuide from "./pages/StudyGuide";
import PhotoContest from "./pages/PhotoContest";
import Newsletter from "./pages/Newsletter";
import TeacherMessages from "./components/TeacherMessages";
import TeacherDashboard from "./pages/TeacherDashboard";
import { recordVisit } from "./pages/Stats";
import "./styles/newspaper.css";

function App() {
  useEffect(() => { recordVisit(); }, []);

  return (
    <AuthProvider>
      <TeacherProvider>
        <Router>
          <div className="app">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login-maestro" element={<TeacherLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/historial" element={<History />} />
              <Route path="/noticias" element={<SectionPage category="noticia" title="Noticias" icon="📰" />} />
              <Route path="/anecdotas" element={<SectionPage category="anecdota" title="Anécdotas" icon="📖" />} />
              <Route path="/chistes" element={<SectionPage category="chiste" title="Chistes" icon="😄" />} />
              <Route path="/programas" element={<SectionPage category="programa" title="Programas Especiales" icon="🎭" />} />
              <Route path="/galeria" element={<Gallery />} />
              <Route path="/cumpleanos" element={<Birthdays />} />
              <Route path="/encuestas" element={<Polls />} />
              <Route path="/meritos" element={<Merits />} />
              <Route path="/calendario" element={<Calendar />} />
              <Route path="/pregunta-al-director" element={<AskDirector />} />
              <Route path="/reto-del-dia" element={<DailyChallenge />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/guia-de-estudios" element={<StudyGuide />} />
              <Route path="/concurso-de-fotos" element={<PhotoContest />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/avisos-maestros" element={<TeacherMessages />} />
              <Route path="/maestro" element={<TeacherDashboard />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </TeacherProvider>
    </AuthProvider>
  );
}

export default App;
