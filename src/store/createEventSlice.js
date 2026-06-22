import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';

const DRAFT_KEY = 'create-event-draft';

const initialTicketType = () => ({ id: crypto.randomUUID(), name: '', price: 0, available: 50 });

const defaultState = {
  step: 1,
  title: '',
  description: '',
  category: 'Technology',
  image: '',
  date: '',
  time: '',
  location: '',
  organizerName: '',
  ticketTypes: [initialTicketType()],
  errors: {},
  status: 'idle',
  publishError: null,
};

function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

function saveDraft(state) {
  const draft = {
    step: state.step,
    title: state.title,
    description: state.description,
    category: state.category,
    image: state.image,
    date: state.date,
    time: state.time,
    location: state.location,
    organizerName: state.organizerName,
    ticketTypes: state.ticketTypes,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export const publishEvent = createAsyncThunk(
  'createEvent/publish',
  async (_, { getState, rejectWithValue }) => {
    const s = getState().createEvent;
    try {
      const event = await api.createEvent({
        title: s.title,
        description: s.description,
        category: s.category,
        image: s.image || `https://picsum.photos/seed/${Date.now()}/400/200`,
        date: s.date,
        time: s.time,
        location: s.location,
        organizerName: s.organizerName || 'Community Organizer',
        ticketTypes: s.ticketTypes.map((t, i) => ({
          id: String(i + 1),
          name: t.name,
          price: Number(t.price),
          available: Number(t.available),
        })),
        likes: 0,
        featured: false,
      });
      localStorage.removeItem(DRAFT_KEY);
      return event;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const createEventSlice = createSlice({
  name: 'createEvent',
  initialState: loadDraft(),
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
      saveDraft(state);
    },
    updateBasicInfo(state, action) {
      Object.assign(state, action.payload);
      saveDraft(state);
    },
    updateDateLocation(state, action) {
      Object.assign(state, action.payload);
      saveDraft(state);
    },
    addTicketType(state) {
      state.ticketTypes.push(initialTicketType());
      saveDraft(state);
    },
    removeTicketType(state, action) {
      if (state.ticketTypes.length > 1) {
        state.ticketTypes = state.ticketTypes.filter((t) => t.id !== action.payload);
        saveDraft(state);
      }
    },
    updateTicketType(state, action) {
      const { id, field, value } = action.payload;
      const ticket = state.ticketTypes.find((t) => t.id === id);
      if (ticket) ticket[field] = value;
      saveDraft(state);
    },
    setErrors(state, action) {
      state.errors = action.payload;
    },
    clearErrors(state) {
      state.errors = {};
    },
    resetForm() {
      localStorage.removeItem(DRAFT_KEY);
      return { ...defaultState, ticketTypes: [initialTicketType()] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(publishEvent.pending, (state) => {
        state.status = 'loading';
        state.publishError = null;
      })
      .addCase(publishEvent.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(publishEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.publishError = action.payload;
      });
  },
});

export const {
  setStep,
  updateBasicInfo,
  updateDateLocation,
  addTicketType,
  removeTicketType,
  updateTicketType,
  setErrors,
  clearErrors,
  resetForm,
} = createEventSlice.actions;

export default createEventSlice.reducer;
