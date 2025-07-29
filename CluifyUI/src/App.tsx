import { useState, Dispatch, SetStateAction } from "react";
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
import { ModalStackProvider } from "./contexts/ModalStackContext";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

interface MainPageProps {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  settingsOpen: boolean;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
  howToPlayOpen: boolean;
  setHowToPlayOpen: Dispatch<SetStateAction<boolean>>;
  isLoggedIn: boolean;
}

const MainPage = ({ darkMode, setDarkMode, settingsOpen, setSettingsOpen, howToPlayOpen, setHowToPlayOpen, isLoggedIn }: MainPageProps) => {
  const [showGame, setShowGame] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptResults, setAttemptResults] = useState<{ [caseId: string]: ('correct' | 'incorrect' | 'insufficient')[] }>({});



  const startGame = async (caseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const caseData = await getCaseById(caseId);
      setActiveCase(caseData);
      const reportData = await getReportsForCase(caseData.Id);
      const reportsWithCaseId = reportData.map(r => ({ ...r, caseId: caseData.Id }));
      setReports(reportsWithCaseId);
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
        await startGame(caseData.Id);
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

  const handleReturnToMainMenu = () => {
    // Only reset tracker for practice cases, never for active case
    if (activeCase?.Id && activeCase.CanBePractice) {
      setAttemptResults(prev => {
        const newResults = { ...prev };
        delete newResults[activeCase.Id];
        return newResults;
      });
    }
    setShowGame(false);
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
            darkMode={darkMode}
            setAttemptsUsed={() => {}}
            attemptResults={attemptResults}
            setAttemptResults={setAttemptResults}
            onReturnToMainMenu={handleReturnToMainMenu}
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [isLoggedIn] = useState(false);

  if (typeof window !== 'undefined') {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  return (
    <Router>
      <ModalStackProvider>
        <div style={{ minHeight: "100vh", width: "100vw", background: darkMode ? "#181818" : "#fff", color: darkMode ? "#fff" : "#000", transition: "background 0.2s, color 0.2s", position: "relative", overflow: "hidden", outline: "none", border: "none", boxShadow: "none" }}>
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
                />
              } 
            />
            <Route path="/register" element={<RegisterPage darkMode={darkMode} />} />
            <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ModalStackProvider>
    </Router>
  );
};

export default App;