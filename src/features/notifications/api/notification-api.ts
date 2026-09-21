import { apiClient } from '../../../lib/api-client'
import { assertSafePathSegment } from '../../../lib/identifiers'
import type { NotificationListParams, NotificationPage, NotificationRead, ReadAllResponse, UnreadCountRead } from '../types/notification-types'

export function listNotifications({ page = 1, page_size = 20 }: NotificationListParams = {}): Promise<NotificationPage> {
  const params = new URLSearchParams({ page: String(page), page_size: String(page_size) })
  return apiClient.get<NotificationPage>(`/notifications?${params.toString()}`)
}

export function unreadNotificationCount(): Promise<UnreadCountRead> {
  return apiClient.get<UnreadCountRead>('/notifications/unread-count')
}

export function markNotificationRead(notificationId: string): Promise<NotificationRead> {
  assertSafePathSegment(notificationId, 'Identificador de notificación')
  return apiClient.patch<NotificationRead>(`/notifications/${notificationId}/read`, {})
}

export function markAllNotificationsRead(): Promise<ReadAllResponse> {
  return apiClient.post<ReadAllResponse>('/notifications/read-all')
}
