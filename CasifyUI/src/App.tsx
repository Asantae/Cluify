import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PlayScreen from "./components/PlayScreen";
import GameScreen from "./components/GameScreen";
import SettingsModal from "./modals/SettingsModal";
import NotFound from "./components/NotFound";
import HowToPlayModal from "./modals/HowToPlayModal";
import ContentWarningModal from "./modals/ContentWarningModal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getActiveCase, getReportsForCase, getCaseById } from "./services/api";
import { Case, Report } from "./types";
import PracticeCasesModal from "./modals/PracticeCasesModal";

interface UserStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
}

interface MainPageProps {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  settingsOpen: boolean;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
  howToPlayOpen: boolean;
  setHowToPlayOpen: Dispatch<SetStateAction<boolean>>;
  isLoggedIn: boolean;
  stats: UserStats;
}

const MainPage = ({ darkMode, setDarkMode, settingsOpen, setSettingsOpen, howToPlayOpen, setHowToPlayOpen, isLoggedIn, stats }: MainPageProps) => {
  const [showGame, setShowGame] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = async (caseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const caseData = await getCaseById(caseId);
      setActiveCase(caseData);
      const reportData = await getReportsForCase(caseData.id);
      setReports(reportData);
      setShowGame(true);
      if (!isLoggedIn) {
        setHowToPlayOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToGame = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const caseData = await getActiveCase();
      if (caseData) {
        await startGame(caseData.id);
      } else {
        setActiveCase(null);
        setReports([]);
        setShowGame(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPracticeCase = (caseId: string) => {
    setPracticeModalOpen(false);
    startGame(caseId);
  };

  const handlePlay = () => {
    const hasAcknowledged = localStorage.getItem('hasAcknowledgedWarning');
    if (hasAcknowledged) {
      proceedToGame();
    } else {
      setShowContentWarning(true);
    }
  };

  const handleAcknowledgeWarning = () => {
    localStorage.setItem('hasAcknowledgedWarning', 'true');
    setShowContentWarning(false);
    proceedToGame();
  };

  if (showGame) {
    return (
      <>
        <Header darkMode={darkMode} onSettings={() => setSettingsOpen(true)} onPractice={() => setPracticeModalOpen(true)} />
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} darkMode={darkMode} setDarkMode={setDarkMode} />
        <HowToPlayModal open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} darkMode={darkMode} />
        <PracticeCasesModal open={practiceModalOpen} onClose={() => setPracticeModalOpen(false)} onSelectCase={handleSelectPracticeCase} darkMode={darkMode} />
        <GameScreen 
            activeCase={activeCase} 
            reports={reports} 
            isLoading={isLoading} 
            error={error} 
        />
        <Footer darkMode={darkMode} />
      </>
    );
  }

  return (
    <>
      <PlayScreen onPlay={handlePlay} darkMode={darkMode} />
      <ContentWarningModal open={showContentWarning} onContinue={handleAcknowledgeWarning} darkMode={darkMode} />
    </>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', true);
  const [stats, setStats] = useLocalStorage<UserStats>('userStats', {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (typeof window !== 'undefined') {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  return (
    <Router>
      <div style={{ minHeight: "100vh", width: "100vw", background: darkMode ? "#181818" : "#fff", transition: "background 0.2s", position: "relative", overflow: "hidden", outline: "none", border: "none", boxShadow: "none" }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <MainPage 
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                howToPlayOpen={howToPlayOpen}
                setHowToPlayOpen={setHowToPlayOpen}
                isLoggedIn={isLoggedIn}
                stats={stats}
              />
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;