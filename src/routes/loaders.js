import { api, delay } from '../api/client';

export async function eventsLoader() {
  const events = await api.getEvents();
  return { events };
}

export async function eventDetailsLoader({ params }) {
  const event = await api.getEvent(params.id);
  // Return promises without awaiting — React Router streams them via Suspense/Await
  const reviews = delay(1500).then(() => api.getReviews(params.id));
  const recommendations = delay(2000).then(() => api.getRecommendations(params.id));

  return { event, reviews, recommendations };
}

export async function bookingsLoader() {
  const bookings = await api.getBookings('user1');
  return { bookings };
}

export async function bookingAction({ request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create-booking') {
    const bookingData = JSON.parse(formData.get('bookingData'));
    const booking = await api.createBooking({
      ...bookingData,
      userId: 'user1',
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      referenceNumber: `BK${Date.now()}`,
    });
    return { success: true, booking };
  }

  if (intent === 'cancel-booking') {
    const bookingId = formData.get('bookingId');
    await api.cancelBooking(bookingId, { status: 'cancelled' });
    return { success: true, bookingId };
  }

  return { success: false };
}

export async function createEventAction({ request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'validate-step') {
    const step = Number(formData.get('step'));
    const errors = {};

    if (step === 1) {
      if (!formData.get('title')?.trim()) errors.title = 'Title is required';
      if (!formData.get('description')?.trim()) errors.description = 'Description is required';
      if (!formData.get('category')) errors.category = 'Category is required';
    }

    if (step === 2) {
      if (!formData.get('date')) errors.date = 'Date is required';
      if (!formData.get('time')) errors.time = 'Time is required';
      if (!formData.get('location')?.trim()) errors.location = 'Location is required';
    }

    return { errors, valid: Object.keys(errors).length === 0 };
  }

  return { success: false };
}
