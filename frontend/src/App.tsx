import './App.css';
import AppRouter from './router/Router';
import { AuthProvider, CartProvider, SettingsProvider } from './context';

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <div className="App min-h-screen flex flex-col bg-gray-50/50 text-gray-900 antialiased font-sans">
            <AppRouter />
          </div>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
