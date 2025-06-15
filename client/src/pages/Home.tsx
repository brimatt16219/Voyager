/* src/Home.tsx */
import { useNavigate } from 'react-router-dom';
import SailIcon from '../assets/sail.svg';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">

      <img src={SailIcon} className="w-90 h-90 mb-0" alt="App Symbol" />
      <h1 className="text-7xl font-bold mb-10 tracking-tight">Voyager</h1>

      {/* “Enter” button → /app */}
      <button
        onClick={() => navigate('/app')}
        className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-700 transition"
      >
        Get Started
      </button>
    </div>
  );
}
