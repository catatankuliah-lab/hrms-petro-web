import { AuthProvider } from './context/AuthContext';
import AppRoutes from './context/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App
