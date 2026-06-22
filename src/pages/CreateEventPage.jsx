import { useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setStep,
  updateBasicInfo,
  updateDateLocation,
  addTicketType,
  removeTicketType,
  updateTicketType,
  setErrors,
  clearErrors,
  publishEvent,
  resetForm,
} from '../store/createEventSlice';

const CATEGORIES = ['Technology', 'Music', 'Arts', 'Sports', 'Food'];
const STEPS = ['Basic Info', 'Date & Tickets', 'Preview'];

function validateStep(step, state) {
  const errors = {};
  if (step === 1) {
    if (!state.title.trim()) errors.title = 'Title is required';
    if (!state.description.trim()) errors.description = 'Description is required';
    if (!state.category) errors.category = 'Category is required';
  }
  if (step === 2) {
    if (!state.date) errors.date = 'Date is required';
    if (!state.time) errors.time = 'Time is required';
    if (!state.location.trim()) errors.location = 'Location is required';
    state.ticketTypes.forEach((t, i) => {
      if (!t.name.trim()) errors[`ticket_${i}_name`] = 'Ticket name required';
    });
  }
  return errors;
}

export default function CreateEventPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s.createEvent);

  const titleId = useId();
  const descId = useId();
  const categoryId = useId();
  const imageId = useId();
  const dateId = useId();
  const timeId = useId();
  const locationId = useId();
  const organizerId = useId();

  const handleNext = () => {
    const errors = validateStep(state.step, state);
    if (Object.keys(errors).length > 0) {
      dispatch(setErrors(errors));
      return;
    }
    dispatch(clearErrors());
    dispatch(setStep(state.step + 1));
  };

  const handleBack = () => {
    dispatch(clearErrors());
    dispatch(setStep(state.step - 1));
  };

  const handlePublish = async () => {
    const errors = validateStep(2, state);
    if (Object.keys(errors).length > 0) {
      dispatch(setErrors(errors));
      dispatch(setStep(2));
      return;
    }
    const result = await dispatch(publishEvent());
    if (publishEvent.fulfilled.match(result)) {
      dispatch(resetForm());
      navigate('/');
    }
  };

  return (
    <div className="create-event-page">
      <div className="page-header">
        <h1>Create Event</h1>
        <p>Draft auto-saved to localStorage</p>
      </div>

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

      {state.step === 1 && (
        <div className="form-step">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label htmlFor={titleId}>Title</label>
            <input
              id={titleId}
              value={state.title}
              onChange={(e) => dispatch(updateBasicInfo({ title: e.target.value }))}
            />
            {state.errors.title && <p className="field-error">{state.errors.title}</p>}
          </div>
          <div className="form-group">
            <label htmlFor={descId}>Description</label>
            <textarea
              id={descId}
              rows={4}
              value={state.description}
              onChange={(e) => dispatch(updateBasicInfo({ description: e.target.value }))}
            />
            {state.errors.description && <p className="field-error">{state.errors.description}</p>}
          </div>
          <div className="form-group">
            <label htmlFor={categoryId}>Category</label>
            <select
              id={categoryId}
              value={state.category}
              onChange={(e) => dispatch(updateBasicInfo({ category: e.target.value }))}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor={imageId}>Image URL (optional)</label>
            <input
              id={imageId}
              value={state.image}
              onChange={(e) => dispatch(updateBasicInfo({ image: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
      )}

      {state.step === 2 && (
        <div className="form-step">
          <h2>Date, Time & Tickets</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={dateId}>Date</label>
              <input
                id={dateId}
                type="date"
                value={state.date}
                onChange={(e) => dispatch(updateDateLocation({ date: e.target.value }))}
              />
              {state.errors.date && <p className="field-error">{state.errors.date}</p>}
            </div>
            <div className="form-group">
              <label htmlFor={timeId}>Time</label>
              <input
                id={timeId}
                value={state.time}
                onChange={(e) => dispatch(updateDateLocation({ time: e.target.value }))}
                placeholder="09:00 AM"
              />
              {state.errors.time && <p className="field-error">{state.errors.time}</p>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor={locationId}>Location</label>
            <input
              id={locationId}
              value={state.location}
              onChange={(e) => dispatch(updateDateLocation({ location: e.target.value }))}
            />
            {state.errors.location && <p className="field-error">{state.errors.location}</p>}
          </div>
          <div className="form-group">
            <label htmlFor={organizerId}>Organizer Name</label>
            <input
              id={organizerId}
              value={state.organizerName}
              onChange={(e) => dispatch(updateDateLocation({ organizerName: e.target.value }))}
            />
          </div>

          <h3>Ticket Types</h3>
          {state.ticketTypes.map((ticket, i) => (
            <div key={ticket.id} className="ticket-type-form">
              <input
                placeholder="Ticket name"
                value={ticket.name}
                onChange={(e) => dispatch(updateTicketType({ id: ticket.id, field: 'name', value: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Price"
                value={ticket.price}
                min="0"
                onChange={(e) => dispatch(updateTicketType({ id: ticket.id, field: 'price', value: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Available"
                value={ticket.available}
                min="1"
                onChange={(e) => dispatch(updateTicketType({ id: ticket.id, field: 'available', value: e.target.value }))}
              />
              {state.ticketTypes.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => dispatch(removeTicketType(ticket.id))}>
                  Remove
                </button>
              )}
              {state.errors[`ticket_${i}_name`] && (
                <p className="field-error">{state.errors[`ticket_${i}_name`]}</p>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => dispatch(addTicketType())}>
            + Add Ticket Type
          </button>
        </div>
      )}

      {state.step === 3 && (
        <div className="form-step preview-step">
          <h2>Preview & Publish</h2>
          <div className="event-preview">
            {state.image && <img src={state.image} alt="Preview" className="preview-image" />}
            <h3>{state.title}</h3>
            <span className="category-tag">{state.category}</span>
            <p>{state.description}</p>
            <p><strong>Date:</strong> {state.date} at {state.time}</p>
            <p><strong>Location:</strong> {state.location}</p>
            <p><strong>Organizer:</strong> {state.organizerName || 'Community Organizer'}</p>
            <h4>Tickets</h4>
            <ul>
              {state.ticketTypes.map((t) => (
                <li key={t.id}>{t.name} — ${t.price} ({t.available} available)</li>
              ))}
            </ul>
          </div>
          {state.publishError && <p className="field-error">{state.publishError}</p>}
        </div>
      )}

      <div className="form-nav">
        {state.step > 1 && (
          <button type="button" className="btn btn-secondary" onClick={handleBack}>Back</button>
        )}
        {state.step < 3 ? (
          <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePublish}
            disabled={state.status === 'loading'}
          >
            {state.status === 'loading' ? 'Publishing...' : 'Publish Event'}
          </button>
        )}
      </div>
    </div>
  );
}
