import { useState, useDeferredValue, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouteLoaderData } from 'react-router-dom';
import { api } from '../api/client';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['All', 'Technology', 'Music', 'Arts', 'Sports', 'Food'];

export default function EventsPage() {
  const loaderData = useRouteLoaderData('root');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const { data: events, isLoading, isError, error } = useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
    initialData: loaderData?.events,
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let result = [...events];

    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') {
      result = result.filter((e) => e.category === category);
    }

    if (dateFrom) {
      result = result.filter((e) => e.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((e) => e.date <= dateTo);
    }

    if (priceMin !== '') {
      result = result.filter((e) =>
        Math.min(...e.ticketTypes.map((t) => t.price)) >= Number(priceMin)
      );
    }
    if (priceMax !== '') {
      result = result.filter((e) =>
        Math.min(...e.ticketTypes.map((t) => t.price)) <= Number(priceMax)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'date') return a.date.localeCompare(b.date);
      const priceA = Math.min(...a.ticketTypes.map((t) => t.price));
      const priceB = Math.min(...b.ticketTypes.map((t) => t.price));
      return priceA - priceB;
    });

    return result;
  }, [events, deferredSearch, category, dateFrom, dateTo, priceMin, priceMax, sortBy]);

  const isSearchStale = search !== deferredSearch;

  if (isLoading) return <LoadingSpinner label="Loading events..." />;
  if (isError) return <div className="error-state">Error: {error.message}</div>;

  return (
    <div className="events-page">
      <div className="page-header">
        <h1>Discover Events</h1>
        <p>Find and book tickets for amazing experiences near you</p>
      </div>

      <div className="filters-bar">
        <input
          type="search"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`search-input ${isSearchStale ? 'stale' : ''}`}
          aria-label="Search events"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Date from" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Date to" />

        <input
          type="number"
          placeholder="Min $"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          min="0"
          aria-label="Minimum price"
        />
        <input
          type="number"
          placeholder="Max $"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          min="0"
          aria-label="Maximum price"
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort by">
          <option value="date">Sort by Date</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      {isSearchStale && <p className="search-hint">Updating results...</p>}

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <p>No events match your filters.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
