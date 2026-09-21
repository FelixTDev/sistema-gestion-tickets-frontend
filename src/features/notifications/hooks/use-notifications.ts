import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listNotifications, markAllNotificationsRead, markNotificationRead, unreadNotificationCount } from '../api/notification-api'

export const notificationsQueryKey = (page: number, pageSize: number) => ['notifications', page, pageSize] as const
export const unreadCountQueryKey = ['notifications', 'unread-count'] as const

export function useNotifications(page: number, pageSize = 20) {
  return useQuery({ queryKey: notificationsQueryKey(page, pageSize), queryFn: () => listNotifications({ page, page_size: pageSize }), retry: false })
}

export function useUnreadNotificationCount() {
  return useQuery({ queryKey: unreadCountQueryKey, queryFn: unreadNotificationCount, retry: false })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
