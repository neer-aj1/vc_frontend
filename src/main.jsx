import './index.css'
import App from './App.jsx'

import {Login, Signup} from "./components/index.js";

import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  }
]);

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <RouterProvider router={router} />
)
