import { createContext, useState } from 'react';

/* eslint-disable react-refresh/only-export-components */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Langsung inisialisasi dari localStorage untuk menghindari cascading renders[cite: 7]
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('jwt_token');
        const role = localStorage.getItem('user_role');
        const nama = localStorage.getItem('user_name');
        
        // Validasi role sistem HRMS yang baru
        const validRoles = [
            'Super Admin', 
            'Project Manager', 
            'Employee', 
            'HR', 
            'Finance', 
            'A Project Manager'
        ];
        
        if (token && role && validRoles.includes(role)) {
            return { role, token, nama };
        } else if (role) {
            // Bersihkan localStorage jika masih ada sisa login dari role lama/project lain[cite: 7]
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_name');
        }
        return null;
    });
    const [loading] = useState(false);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};