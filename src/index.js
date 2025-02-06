import React from "react";
import ReactDOM from "react-dom/client"; // createRoot를 사용하려면 'react-dom/client'에서 import 해야 해
import { BrowserRouter } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import './index.css';

// React 18에서는 createRoot()로 앱을 렌더링
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>

            <App />

    </BrowserRouter>
);
