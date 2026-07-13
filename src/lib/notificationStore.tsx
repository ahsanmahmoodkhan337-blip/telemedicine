// ============================================================
// In-App Notification Store — React Context + Provider
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

// ─── Types ───

export type NotificationType =
  | 'appointment_reminder'
  | 'prescription_ready'
  | 'verification_status'
  | 'lab_result'
  | 'message'
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

// ─── Context ───

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  getUnreadCount: () => number
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

// ─── Mock seed data ───

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message: 'You have a video consultation with Ahmed Raza tomorrow at 10:00 AM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    read: false,
    actionUrl: '/doctor/appointments/1',
  },
  {
    id: 'n2',
    type: 'prescription_ready',
    title: 'Prescription Ready for Pickup',
    message: 'Prescription RX-003 for Bilal Khan has been dispensed and is ready for pickup.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    actionUrl: '/pharmacist/inbox',
  },
  {
    id: 'n3',
    type: 'lab_result',
    title: 'Lab Results Available',
    message: 'New lab results for Sana Tariq (CBC, Lipid Profile) are now available for review.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: false,
    actionUrl: '/doctor/appointments/2',
  },
  {
    id: 'n4',
    type: 'verification_status',
    title: 'Verification Approved',
    message: 'Your practitioner credentials have been verified. You can now start accepting patients.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: 'n5',
    type: 'message',
    title: 'New Message from Patient',
    message: 'Zainab Ali sent you a message regarding her recent prescription refill.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
    read: false,
    actionUrl: '/doctor/dashboard',
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Platform Update',
    message: 'New features available: AI Recipe Builder and enhanced ROM tracking for physiotherapists.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
]

// ─── Provider ───

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS)

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// ─── Hook ───

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return ctx
}

// ─── Icon mapping ───

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  appointment_reminder: '📅',
  prescription_ready: '💊',
  verification_status: '✅',
  lab_result: '🔬',
  message: '💬',
  system: '🔔',
}

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  appointment_reminder: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  prescription_ready: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  verification_status: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  lab_result: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  message: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  system: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}
