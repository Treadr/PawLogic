import { NavLink, Outlet } from 'react-router-dom';
import { usePets } from '../context/PetContext';
import { useAuth } from '../context/AuthContext';
import type { Pet } from '../types';

function PetSelector({ pets, selectedPet, onSelect }: { pets: Pet[]; selectedPet: Pet | null; onSelect: (p: Pet) => void }) {
  if (pets.length === 0) return null;
  return (
    <div className="pet-selector">
      <label>Active Pet</label>
      <select
        value={selectedPet?.id ?? ''}
        onChange={(e) => {
          const pet = pets.find((p) => p.id === e.target.value);
          if (pet) onSelect(pet);
        }}
      >
        {pets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.species === 'cat' ? '🐱' : '🐶'} {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/pets', label: 'Pets', icon: '🐾' },
  { to: '/abc-logs', label: 'Behavior Logs', icon: '📝' },
  { to: '/insights', label: 'Insights', icon: '💡' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/coaching', label: 'Coaching', icon: '🧠' },
  { to: '/settings', label: 'Settings', icon: '\u2699\ufe0f' },
];

export default function Layout() {
  const { pets, selectedPet, selectPet } = usePets();
  const { logout } = useAuth();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>PawLogic</h1>
          <span className="brand-tagline">The science behind the paws.</span>
        </div>

        <PetSelector pets={pets} selectedPet={selectedPet} onSelect={selectPet} />

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
