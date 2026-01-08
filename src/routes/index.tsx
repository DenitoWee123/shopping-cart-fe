import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import AboutUs from "../pages/AboutUs";
import ContactUs from "../pages/ContactUs";
import Profile from "../pages/Profile";
import Carts from "../pages/Carts";
import CartDetail from "../pages/CartDetail";
import NotFound from "../pages/NotFound";
import RequireAuth from "../components/RequireAuth";
import RequireGuest from "../components/RequireGuest";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { 
        path: "/login", 
        element: (
          <RequireGuest>
            <Login />
          </RequireGuest>
        ) 
      },
      { 
        path: "/register", 
        element: (
          <RequireGuest>
            <Register />
          </RequireGuest>
        ) 
      },
      { 
        path: "/forgot-password", 
        element: (
          <RequireGuest>
            <ForgotPassword />
          </RequireGuest>
        ) 
      },
      { path: "/about", element: <AboutUs /> },
      { path: "/contact", element: <ContactUs /> },
      { 
        path: "/profile", 
        element: (
          <RequireAuth>
            <Profile />
          </RequireAuth>
        ) 
      },
      { 
        path: "/carts", 
        element: (
          <RequireAuth>
            <Carts />
          </RequireAuth>
        ) 
      },
      { 
        path: "/carts/:cartId", 
        element: (
          <RequireAuth>
            <CartDetail />
          </RequireAuth>
        ) 
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
