import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">GitGauge</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-300">Dashboard</Link></li>
            <li><Link to="/analyze" className="hover:text-blue-300">Analyze</Link></li>
            <li><Link to="/settings" className="hover:text-blue-300">Settings</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}