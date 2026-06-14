import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./styles/index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <NotificationProvider>
                    <CartProvider>
                        <App />
                    </CartProvider>
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);