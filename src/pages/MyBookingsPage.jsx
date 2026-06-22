import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouteLoaderData } from 'react-router-dom';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const FILTERS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

function isUpcoming(booking) {
  return booking.status === 'confirmed' && booking.eventDate >= new Date().toISOString().split('T')[0];
}

function isPast(booking) {
  return booking.status === 'confirmed' && booking.eventDate < new Date().toISOString().split('T')[0];
}

export default function MyBookingsPage() {
  const loaderData = useRouteLoaderData('bookings');
  const [filter, setFilter] = useState('upcoming');
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', 'user1', filter],
    queryFn: () => api.getBookings('user1'),
    initialData: loaderData?.bookings,
    staleTime: filter === 'upcoming' ? 1000 * 60 * 5 : 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
    select: (data) => {
      if (filter === 'upcoming') return data.filter(isUpcoming);
      if (filter === 'past') return data.filter(isPast);
      if (filter === 'cancelled') return data.filter((b) => b.status === 'cancelled');
      return data;
    },
    enabled: true,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => api.cancelBooking(bookingId, { status: 'cancelled' }),
    onMutate: async (bookingId) => {
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      const previous = queryClient.getQueryData(['bookings', 'user1', filter]);
      queryClient.setQueryData(['bookings', 'user1', filter], (old) =>
        old?.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      queryClient.setQueryData(['bookings', 'user1'], (old) =>
        old?.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['bookings', 'user1', filter], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  if (isLoading) return <LoadingSpinner label="Loading bookings..." />;
  if (isError) return <div className="error-state">Error: {error.message}</div>;

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Manage your event tickets and reservations</p>
      </div>

      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No {filter} bookings found.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <article key={booking.id} className={`booking-card status-${booking.status}`}>
              <div className="booking-card-header">
                <h3>{booking.eventTitle}</h3>
                <span className={`status-badge ${booking.status}`}>{booking.status}</span>
              </div>
              <p className="booking-meta">
                {booking.eventDate} &middot; Ref: {booking.referenceNumber}
              </p>
              <div className="booking-tickets">
                {booking.tickets.map((t) => (
                  <span key={t.type} className="ticket-chip">
                    {t.quantity}x {t.type} (${t.price})
                  </span>
                ))}
              </div>
              <p className="booking-total">Total: ${booking.totalAmount}</p>
              {booking.status === 'confirmed' && filter === 'upcoming' && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => cancelMutation.mutate(booking.id)}
                  disabled={cancelMutation.isPending}
                >
                  Cancel Booking
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
