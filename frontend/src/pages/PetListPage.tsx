import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePets } from '../context/PetContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function PetListPage() {
  const { pets, isLoading, error, refreshPets } = usePets();
  const navigate = useNavigate();

  useEffect(() => {
    refreshPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && pets.length === 0) return <LoadingSpinner message="Loading pets..." />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>My Pets</h2>
          <p>{pets.length} pet{pets.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Link to="/pets/add" className="btn btn-primary">
          + Add Pet
        </Link>
      </div>

      {error && <ErrorBanner message={error} />}

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">\ud83d\udc3e</div>
          <h3>No pets yet</h3>
          <p>Add your first pet to start tracking behaviors.</p>
        </div>
      ) : (
        <div className="card-grid">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="pet-card"
              onClick={() => navigate(`/pets/${pet.id}`)}
            >
              <div className="pet-icon">
                {pet.species === 'cat' ? '\ud83d\udc31' : '\ud83d\udc36'}
              </div>
              <h3>{pet.name}</h3>
              <div className="pet-meta">
                {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                {pet.breed && ` \u2022 ${pet.breed}`}
                {pet.age_years != null && ` \u2022 ${pet.age_years}y`}
                {pet.age_months != null && pet.age_months > 0 && ` ${pet.age_months}m`}
              </div>
              {pet.temperament && pet.temperament.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {pet.temperament.map((t) => (
                    <span key={t} className="chip" style={{ fontSize: '0.72rem', padding: '2px 8px', marginRight: 4 }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
