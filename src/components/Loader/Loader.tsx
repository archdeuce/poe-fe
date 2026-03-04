import React from 'react';
import { useLoading } from '@/context/LoadingContext';
import './Loader.style.scss';

const Loader: React.FC = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;
