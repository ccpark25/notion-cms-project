import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: string;
}

interface UIStore {
  // 사이드바 상태
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;

  // 모달 상태
  modal: ModalState;
  openModal: (title: string, content?: string) => void;
  closeModal: () => void;

  // 알림 상태
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // 사이드바 초기 상태
      isSidebarOpen: true,
      isSidebarCollapsed: false,

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      // 모달 초기 상태
      modal: { isOpen: false },

      openModal: (title, content) =>
        set({ modal: { isOpen: true, title, content } }),

      closeModal: () =>
        set({ modal: { isOpen: false, title: undefined, content: undefined } }),

      // 알림 초기 상태
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: crypto.randomUUID(),
              read: false,
              createdAt: new Date(),
            },
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "ui-store",
      storage: createJSONStorage(() => localStorage),
      // 알림은 세션 간 유지하지 않음
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
