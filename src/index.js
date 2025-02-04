import React from "react";
import ReactDOM from "react-dom/client"; // createRoot를 사용하려면 'react-dom/client'에서 import 해야 해
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // AuthProvider 임포트
import App from "./App";

// React 18에서는 createRoot()로 앱을 렌더링
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
        <AuthProvider> {/* AuthProvider로 감싸기 */}
            <App />
        </AuthProvider>
    </BrowserRouter>
);
