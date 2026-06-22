import { Suspense } from 'react';
import { Link, useLoaderData, Await } from 'react-router';
import LoadingSpinner from '../components/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

function ReviewsSection({ reviewsPromise }) {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading reviews..." />}>
      <Await resolve={reviewsPromise}>
        {(reviews) => (
          <section className="reviews-section">
            <h2>Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <strong>{review.author}</strong>
                      <span className="rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </Await>
    </Suspense>
  );
}

function RecommendationsSection({ recommendationsPromise, allEvents }) {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading recommendations..." />}>
      <Await resolve={recommendationsPromise}>
        {(recommendations) => {
          const recommended = recommendations
            .map((r) => allEvents?.find((e) => e.id === r.recommendedEventId))
            .filter(Boolean);

          return (
            <section className="recommendations-section">
              <h2>You Might Also Like</h2>
              {recommended.length === 0 ? (
                <p>No recommendations available.</p>
              ) : (
                <div className="recommendations-list">
                  {recommended.map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`} className="recommendation-card">
                      <img src={event.image} alt={event.title} />
                      <div>
                        <h4>{event.title}</h4>
                        <p>{event.date} &middot; {event.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        }}
      </Await>
    </Suspense>
  );
}

export default function EventDetailsPage() {
  const { event, reviews, recommendations } = useLoaderData();
  const { data: allEvents } = useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
  });

  return (
    <div className="event-details-page">
      <div className="event-hero">
        <img src={event.image} alt={event.title} className="event-hero-image" />
        <div className="event-hero-content">
          <span className="category-tag">{event.category}</span>
          <h1>{event.title}</h1>
          <p className="organizer">Organized by {event.organizerName}</p>
          <div className="event-info-grid">
            <div><strong>Date</strong><p>{event.date}</p></div>
            <div><strong>Time</strong><p>{event.time}</p></div>
            <div><strong>Location</strong><p>{event.location}</p></div>
            <div><strong>Likes</strong><p>{event.likes}</p></div>
          </div>
        </div>
      </div>

      <div className="event-details-body">
        <section className="description-section">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </section>

        <section className="tickets-section">
          <h2>Ticket Types</h2>
          <div className="ticket-types-list">
            {event.ticketTypes.map((ticket) => (
              <div key={ticket.id} className="ticket-type-card">
                <div>
                  <h3>{ticket.name}</h3>
                  <p className="ticket-price">${ticket.price}</p>
                </div>
                <span className={`availability ${ticket.available < 10 ? 'low' : ''}`}>
                  {ticket.available} available
                </span>
              </div>
            ))}
          </div>
          <Link to={`/book/${event.id}`} className="btn btn-primary btn-lg">
            Book Now
          </Link>
        </section>

        <ReviewsSection reviewsPromise={reviews} />
        <RecommendationsSection recommendationsPromise={recommendations} allEvents={allEvents} />
      </div>
    </div>
  );
}
