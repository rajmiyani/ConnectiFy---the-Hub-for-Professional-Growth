import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Try to load user from localStorage on initial load
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("connectify_user");
            return savedUser ? JSON.parse(savedUser) : {
                firstName: "",
                lastName: "",
                role: "",
                headline: "",
                email: "",
                avatar: "",
                panel: "user",
                bio: "",
                location: "",
                linkedin: "#",
                portfolio: "#",
                skills: [],
                connections: 0,
                profileViews: 0,
                posts: 0,
                experiences: [],
                education: [],
                university: "",
                courseName: "",
                cgpa: "",
                interest: "",
                startYear: "",
                passingYear: ""
            };
        } catch (error) {
            console.error("Error loading user from localStorage:", error);
            return {
                firstName: "",
                lastName: "",
                role: "",
                headline: "",
                email: "",
                avatar: "",
                panel: "user",
                bio: "",
                location: "",
                linkedin: "#",
                portfolio: "#",
                skills: [],
                connections: 0,
                profileViews: 0,
                posts: 0,
                experiences: [],
                education: [],
                university: "",
                courseName: "",
                cgpa: "",
                interest: "",
                startYear: "",
                passingYear: ""
            };
        }
    });

    // Helper to strip large data fields before saving to localStorage
    const getPersistableUser = (userData) => {
        if (!userData) return null;

        // Deep clone to avoid mutating state
        const persistable = JSON.parse(JSON.stringify(userData));

        // Fields that can be large (Base64 strings, long URLs, large arrays)
        const largeFields = [
            "profileImg", "coverPhoto", "avatar", "banner",
            "resume", "logo", "mediaUrl"
        ];

        // Recursively strip large strings
        const stripLargeData = (obj) => {
            if (!obj || typeof obj !== "object") return;

            Object.keys(obj).forEach(key => {
                const value = obj[key];

                // If the field is known to be large or is a very long string
                if (largeFields.includes(key) || (typeof value === "string" && value.length > 10000)) {
                    delete obj[key];
                } else if (typeof value === "object") {
                    stripLargeData(value);
                }
            });
        };

        stripLargeData(persistable);

        // Also ensure nested arrays like experiences/education aren't carrying excessive weight
        // if they were to contain images (unlikely but safe to check)

        return persistable;
    };

    // Re-fetch full user profile data on load to ensure large fields (images) are present
    useEffect(() => {
        const fetchFullProfile = async () => {
            if (!user?.id) return;

            try {
                const isAdmin = user.role === 'admin' || user.panel === 'admin';
                const isCompany = user.role === 'COMPANY' || user.accountType === 'company' || user.panel === 'company';

                let endpoint = "";
                if (isAdmin) {
                    endpoint = "/admin/profile";
                } else if (isCompany) {
                    endpoint = `/companies/profile/${user.id}`;
                } else {
                    endpoint = `/users/profile/${user.id}`;
                }

                const response = await api.get(endpoint);
                const data = response.data;

                if (data.success) {
                    // Update user state with full data from backend
                    setUser(prev => ({ ...prev, ...data.data }));
                }
            } catch (error) {
                console.error("Error re-fetching profile:", error);
            }
        };

        // Only fetch if we have a basic user from localStorage but potentially missing fields
        if (user?.id) {
            fetchFullProfile();
        }
    }, []); // Run once on mount

    // Save user to localStorage whenever it changes
    useEffect(() => {
        try {
            if (user) {
                const persistableUser = getPersistableUser(user);
                const userString = JSON.stringify(persistableUser);

                // Double check size before attempt (optional but safer)
                if (userString.length > 2 * 1024 * 1024) { // 2MB limit for user object
                    console.warn("User object still too large for localStorage even after stripping.");
                    return;
                }

                localStorage.setItem("connectify_user", userString);
            } else {
                localStorage.removeItem("connectify_user");
            }
        } catch (error) {
            console.error("LocalStorage persistence error:", error);

            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn("Storage quota exceeded. Clearing non-essential data...");
                try {
                    // Strategy: Clear EVERYTHING and only keep essential auth tokens to maintain session
                    const token = localStorage.getItem("connectify_token");
                    const refreshToken = localStorage.getItem("connectify_refresh_token");

                    localStorage.clear();

                    if (token) localStorage.setItem("connectify_token", token);
                    if (refreshToken) localStorage.setItem("connectify_refresh_token", refreshToken);

                    // Attempt to save a MINIMAL user object (only IDs and roles)
                    if (user?.id) {
                        const minimalUser = {
                            id: user.id,
                            role: user.role,
                            panel: user.panel,
                            email: user.email
                        };
                        localStorage.setItem("connectify_user", JSON.stringify(minimalUser));
                    }
                } catch (clearError) {
                    console.error("Critical failure clearing storage:", clearError);
                }
            }
        }
    }, [user]);

    const login = (userData, token, refreshToken) => {
        setUser(userData);
        if (token) localStorage.setItem("connectify_token", token);
        if (refreshToken) localStorage.setItem("connectify_refresh_token", refreshToken);
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("connectify_refresh_token");
            const userId = user?.id;
            const isCompany = user?.panel === 'company';

            if (refreshToken && userId) {
                const endpoint = isCompany
                    ? "/companies/logout"
                    : "/users/logout";

                await api.post(endpoint, { refreshToken, [isCompany ? 'companyId' : 'userId']: userId });
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
            localStorage.removeItem("connectify_user");
            localStorage.removeItem("connectify_token");
            localStorage.removeItem("connectify_refresh_token");
        }
    };

    const updateUser = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
