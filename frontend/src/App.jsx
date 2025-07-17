import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard, Analysis, Repository, Settings } from './pages';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyze" element={<Analysis />} />
        <Route path="/repo" element={<Repository />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}