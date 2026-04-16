import { useState } from 'react';
import './index.css';
import Login from './components/Login';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={setUser} />;
  return <Layout user={user} onLogout={() => setUser(null)} />;
}
