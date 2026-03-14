import AppRoutes from "./routes/AppRoutes";
import { useAuthInit } from "./hooks/auth/useAuth";

function App() {
  // Initialises Supabase session on mount and subscribes to auth state changes.
  // Must be called once at the root of the app — not inside a route.
  useAuthInit();

  return <AppRoutes />;
}

export default App;