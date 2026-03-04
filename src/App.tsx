import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home/Home';
import Layout from './components/Layout';
import Loader from './components/Loader';
import OcrGems from './pages/OcrGems/OcrGems';
import { ROUTES } from './utils/constants';

const App = () => {
  return (
    <>
      <Loader />
      <Routes>
        <Route
          path={ROUTES.MAIN.URL}
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path={ROUTES.OCR_GEMS.URL}
          element={
            <Layout>
              <OcrGems />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
      </Routes>
    </>
  );
};

export default App;
