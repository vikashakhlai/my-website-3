import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "./ui/provider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./components/routes.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);
