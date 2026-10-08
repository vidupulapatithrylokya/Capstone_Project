// client/src/store/useAppStore.js
import { create } from "zustand";

export const useAppStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  aiChatHistory: [],
  enrolledCourses: [],
  currentCourse: null,
  activeTab: "dashboard",
  theme: "dark",

  setUser: (user, token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, aiChatHistory: [] });
  },

  addAiChatMessage: (message) =>
    set((state) => ({ aiChatHistory: [...state.aiChatHistory, message] })),

  clearAiChatHistory: () => set({ aiChatHistory: [] }),

  setEnrolledCourses: (courses) => set({ enrolledCourses: courses }),

  setCurrentCourse: (course) => set({ currentCourse: course }),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
