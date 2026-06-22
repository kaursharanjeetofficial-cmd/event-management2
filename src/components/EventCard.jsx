import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

export default function EventCard({ event }) {
  const { user, updateFavorites } = useAuth();
  const queryClient = useQueryClient();
  const isFavorite = user.favoriteEvents.includes(event.id);

  const likeMutation = useMutation({
    mutationFn: async (newLikes) => {
      return api.updateEvent(event.id, { likes: newLikes });
    },
    onMutate: async (newLikes) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      const previous = queryClient.getQueryData(['events']);
      queryClient.setQueryData(['events'], (old) =>
        old?.map((e) => (e.id === event.id ? { ...e, likes: newLikes } : e))
      );
      return { previous };
    },
    onError: (_err, _newLikes, context) => {
      queryClient.setQueryData(['events'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikes = isFavorite ? event.likes - 1 : event.likes + 1;
    updateFavorites(event.id, !isFavorite);
    likeMutation.mutate(newLikes);
  };

  const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));

  return (
    <article className="event-card">
      <Link to={`/events/${event.id}`} className="event-card-link">
        <div className="event-card-image">
          <img src={event.image} alt={event.title} loading="lazy" />
          {event.featured && <span className="badge featured">Featured</span>}
        </div>
        <div className="event-card-body">
          <span className="category-tag">{event.category}</span>
          <h3>{event.title}</h3>
          <p className="event-meta">
            {event.date} &middot; {event.location}
          </p>
          <p className="event-price">
            {minPrice === 0 ? 'Free' : `From $${minPrice}`}
          </p>
        </div>
      </Link>
      <button
        type="button"
        className={`like-btn ${isFavorite ? 'liked' : ''}`}
        onClick={handleLike}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? '❤️' : '🤍'} {event.likes}
      </button>
    </article>
  );
}
