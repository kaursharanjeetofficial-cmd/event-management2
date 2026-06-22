import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import ErrorPage from '../components/ErrorPage';
import EventsPage from '../pages/EventsPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import BookingPage from '../pages/BookingPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import CreateEventPage from '../pages/CreateEventPage';
import ProfilePage from '../pages/ProfilePage';
import {
  eventsLoader,
  eventDetailsLoader,
  bookingsLoader,
  bookingAction,
  createEventAction,
} from './loaders';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    id: 'root',
    loader: eventsLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <EventsPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'events/:id',
        element: <EventDetailsPage />,
        loader: eventDetailsLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: 'book/:eventId',
        element: <BookingPage />,
        action: bookingAction,
        errorElement: <ErrorPage />,
      },
      {
        path: 'my-bookings',
        id: 'bookings',
        element: <MyBookingsPage />,
        loader: bookingsLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: 'create-event',
        element: <CreateEventPage />,
        action: createEventAction,
        errorElement: <ErrorPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);
