import { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { put_token, get_token, remove_token } from "./utils/cookies";

import ProtectedRoute from "./utils/ProtectedRoute";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile";
import CarsListPage from "./pages/CarsList";
import CarPage from "./pages/Car";
import api from "./utils/Api";
import { Car } from "./types/Car";
import AdminTools from "./pages/AdminTools";
import PermissionDenied from "./pages/PermissionDenied";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<Car[] | undefined>(undefined);

  const handleLogIn = useCallback((token: string) => {
    put_token(token);
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  const handleLogOut = useCallback(() => {
    remove_token();
    setIsAuthenticated(false);
  }, [setIsAuthenticated]);

  useEffect(() => {
    const token = get_token();
    console.log(token);
    if (token) {
      api.getCurrentUserRole(token)
        .then(data => {
          console.log(data);
          setIsAdmin(data.role === 'admin');
        })
        .catch(err => {
          handleLogOut();
          console.warn(err);
        })
        .finally(() => {
          setLoading(false);
        });
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }

    api.getAllProducts()
      .then((data) => setCars(data))
      .catch((err) => console.warn(err));
  }, [handleLogOut]);

  if (loading || !cars) {
    return <div>loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <CarsListPage 
              cars={cars}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              component={ProfilePage}
              isAuthenticated={isAuthenticated}
              checkAdminPermission={false}
              isAdmin={isAdmin}
              handleLogOut={handleLogOut}
            />
          }
        />
        <Route 
          path="/auth" 
          element={
            <AuthPage 
              handleLogin={handleLogIn}
            />
          }
        />
        <Route 
          path="/car"
          element={<Navigate to="/car/0" />}
        />
        <Route 
          path="/car/:index"
          element={
            <CarPage
              cars={cars}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="admin-tools"
          element={
            <ProtectedRoute
              component={AdminTools}
              isAuthenticated={isAuthenticated}
              checkAdminPermission={true}
              isAdmin={isAdmin}
            />
          }
        />
        <Route 
          path="/permission-denied" 
          element={<PermissionDenied />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
