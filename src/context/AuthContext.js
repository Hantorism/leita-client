import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider, signInWithPopup, signOut } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe(); // Cleanup
    }, []);


const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user); // 로그인 성공 시 사용자 정보 저장
    } catch (error) {
        console.error("Google Login Error:", error);
    }
};

const logout = async () => {
    await signOut(auth);
    setUser(null);
};

return (
    <AuthContext.Provider value={{ user, signInWithGoogle, logout }}>
        {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };

