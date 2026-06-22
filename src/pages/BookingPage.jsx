import { useReducer, useOptimistic, useId } from 'react';
import { useNavigate, useParams, useFetcher } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const STEPS = ['Select Tickets', 'Attendee Info', 'Confirmation'];

const initialState = {
  step: 1,
  selectedTickets: {},
  attendee: { name: '', email: '', phone: '' },
  errors: {},
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, errors: {} };
    case 'SET_TICKET':
      return {
        ...state,
        selectedTickets: { ...state.selectedTickets, [action.ticketId]: action.quantity },
      };
    case 'SET_ATTENDEE':
      return {
        ...state,
        attendee: { ...state.attendee, [action.field]: action.value },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function validateStep(step, state) {
  const errors = {};
  if (step === 1) {
    const hasTickets = Object.values(state.selectedTickets).some((q) => q > 0);
    if (!hasTickets) errors.tickets = 'Please select at least one ticket';
  }
  if (step === 2) {
    if (!state.attendee.name.trim()) errors.name = 'Name is required';
    if (!state.attendee.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(state.attendee.email)) errors.email = 'Invalid email';
    if (!state.attendee.phone.trim()) errors.phone = 'Phone is required';
  }
  return errors;
}

export default function BookingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetcher = useFetcher();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();

  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const [optimisticBookings, addOptimisticBooking] = useOptimistic(
    [],
    (current, newBooking) => [...current, newBooking]
  );

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEvent(eventId),
  });

  const bookingMutation = useMutation({
    mutationFn: (bookingData) => {
      const payload = {
        ...bookingData,
        referenceNumber: bookingData.referenceNumber || `BK${String(Date.now())}`,
      };
      return api.createBooking(payload);
    },
    onMutate: async (bookingData) => {
      const optimistic = {
        id: `temp-${Date.now()}`,
        ...bookingData,
        status: 'confirmed',
        isOptimistic: true,
      };
      addOptimisticBooking(optimistic);
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      const previous = queryClient.getQueryData(['bookings', 'user1']);
      queryClient.setQueryData(['bookings', 'user1'], (old) => [...(old || []), optimistic]);
      return { previous };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(['bookings', 'user1'], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      dispatch({ type: 'RESET' });
      navigate('/my-bookings');
    },
  });

  if (isLoading) return <LoadingSpinner label="Loading event..." />;
  if (!event) return <div className="error-state">Event not found</div>;

  const total = event.ticketTypes.reduce((sum, ticket) => {
    const qty = state.selectedTickets[ticket.id] || 0;
    return sum + qty * ticket.price;
  }, 0);

  const selectedTicketDetails = event.ticketTypes
    .filter((t) => state.selectedTickets[t.id] > 0)
    .map((t) => ({
      type: t.name,
      quantity: state.selectedTickets[t.id],
      price: t.price,
    }));

  const handleNext = () => {
    const errors = validateStep(state.step, state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
      return;
    }
    dispatch({ type: 'SET_STEP', payload: state.step + 1 });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: state.step - 1 });
  };

  const handleSubmit = () => {
    const errors = validateStep(2, state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
      dispatch({ type: 'SET_STEP', payload: 2 });
      return;
    }

    const bookingData = {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      tickets: selectedTicketDetails,
      attendees: [state.attendee],
      totalAmount: total,
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      userId: 'user1',
    };

    bookingMutation.mutate(bookingData);
  };

  return (
    <div className="booking-page">
      <h1>Book Tickets</h1>
      <p className="booking-event-title">{event.title}</p>

      <div className="progress-indicator">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`progress-step ${state.step > i + 1 ? 'completed' : ''} ${state.step === i + 1 ? 'active' : ''}`}
          >
            <span className="step-number">{i + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="booking-step-content">
        {state.step === 1 && (
          <div className="step-tickets">
            <h2>Select Tickets</h2>
            {state.errors.tickets && <p className="field-error">{state.errors.tickets}</p>}
            {event.ticketTypes.map((ticket) => (
              <div key={ticket.id} className="ticket-select-row">
                <div>
                  <strong>{ticket.name}</strong>
                  <p>${ticket.price} &middot; {ticket.available} left</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max={ticket.available}
                  value={state.selectedTickets[ticket.id] || 0}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_TICKET',
                      ticketId: ticket.id,
                      quantity: Math.min(Number(e.target.value), ticket.available),
                    })
                  }
                  aria-label={`Quantity for ${ticket.name}`}
                />
              </div>
            ))}
            <div className="booking-total">
              <strong>Total: ${total}</strong>
            </div>
          </div>
        )}

        {state.step === 2 && (
          <fetcher.Form method="post" className="step-attendee">
            <h2>Attendee Information</h2>
            <input type="hidden" name="intent" value="validate-step" />
            <input type="hidden" name="step" value="2" />

            <div className="form-group">
              <label htmlFor={nameId}>Full Name</label>
              <input
                id={nameId}
                name="name"
                type="text"
                value={state.attendee.name}
                onChange={(e) => dispatch({ type: 'SET_ATTENDEE', field: 'name', value: e.target.value })}
              />
              {state.errors.name && <p className="field-error">{state.errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor={emailId}>Email</label>
              <input
                id={emailId}
                name="email"
                type="email"
                value={state.attendee.email}
                onChange={(e) => dispatch({ type: 'SET_ATTENDEE', field: 'email', value: e.target.value })}
              />
              {state.errors.email && <p className="field-error">{state.errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor={phoneId}>Phone</label>
              <input
                id={phoneId}
                name="phone"
                type="tel"
                value={state.attendee.phone}
                onChange={(e) => dispatch({ type: 'SET_ATTENDEE', field: 'phone', value: e.target.value })}
              />
              {state.errors.phone && <p className="field-error">{state.errors.phone}</p>}
            </div>
          </fetcher.Form>
        )}

        {state.step === 3 && (
          <div className="step-confirmation">
            <h2>Confirm Your Booking</h2>
            <div className="confirmation-summary">
              <h3>{event.title}</h3>
              <p>{event.date} at {event.time}</p>
              <p>{event.location}</p>
              <hr />
              <h4>Tickets</h4>
              {selectedTicketDetails.map((t) => (
                <p key={t.type}>{t.quantity}x {t.type} — ${t.quantity * t.price}</p>
              ))}
              <hr />
              <h4>Attendee</h4>
              <p>{state.attendee.name}</p>
              <p>{state.attendee.email}</p>
              <p>{state.attendee.phone}</p>
              <hr />
              <p className="total-line"><strong>Total: ${total}</strong></p>
            </div>

            {optimisticBookings.length > 0 && (
              <p className="optimistic-hint">Processing your booking...</p>
            )}
          </div>
        )}
      </div>

      <div className="booking-nav">
        {state.step > 1 && (
          <button type="button" className="btn btn-secondary" onClick={handleBack}>
            Back
          </button>
        )}
        {state.step < 3 ? (
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={bookingMutation.isPending}
          >
            {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
          </button>
        )}
      </div>

      {bookingMutation.isError && (
        <p className="field-error">Booking failed: {bookingMutation.error.message}. Please try again.</p>
      )}
    </div>
  );
}
