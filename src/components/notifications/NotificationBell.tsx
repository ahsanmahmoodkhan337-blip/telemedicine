import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import {
  Bell,
  CheckCheck,
  CalendarDays,
  Pill,
  FlaskConical,
  MessageSquare,
  ShieldCheck,
  Megaphone,
  ExternalLink,
} from 'lucide-react'
import { useNotifications, NOTIFICATION_COLORS } from '@/lib/notificationStore'
import type { Notification, NotificationType } from '@/lib/notificationStore'

const NOTIF_ICONS: Record<NotificationType, typeof Bell> = {
  appointment_reminder: CalendarDays,
  prescription_ready: Pill,
  verification_status: ShieldCheck,
  lab_result: FlaskConical,
  message: MessageSquare,
  system: Megaphone,
}

function timeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id)
    if (n.actionUrl) {
      navigate(n.actionUrl)
    }
    setOpen(false)
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs font-normal text-gray-500">({unreadCount} unread)</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((n) => {
                  const Icon = NOTIF_ICONS[n.type]
                  const colorClasses = NOTIFICATION_COLORS[n.type]
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        'w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50',
                        !n.read && 'bg-primary-50/30 dark:bg-primary-900/5',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            colorClasses,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'text-sm leading-tight',
                                n.read ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-slate-900 dark:text-white',
                              )}
                            >
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {n.message}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">{timeAgo(n.timestamp)}</span>
                            {n.actionUrl && (
                              <ExternalLink className="h-3 w-3 text-gray-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
