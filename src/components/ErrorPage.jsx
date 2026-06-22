import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? 'Page Not Found' : `Error ${error.status}`;
    message = error.statusText || error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="error-page">
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/" className="btn btn-primary">Back to Events</Link>
    </div>
  );
}
