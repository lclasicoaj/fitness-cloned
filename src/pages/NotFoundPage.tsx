import { Link } from 'react-router-dom';
import { Empty } from '../components/ui';

export default function NotFoundPage() {
  return (
    <Empty title="Page not found">
      <Link to="/" className="btn-primary mt-2">
        Go home
      </Link>
    </Empty>
  );
}
