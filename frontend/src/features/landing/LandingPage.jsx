import { useNavigate } from 'react-router-dom';
import LandingPageView from '../../components/LandingPageView';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLaunchApp = () => {
    navigate('/studio');
  };

  return <LandingPageView onLaunchApp={handleLaunchApp} />;
}
