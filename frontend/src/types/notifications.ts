// Types for notification system

export interface Notification {
  id: number
  title: string
  message: string
  type: NotificationType
  delivery_channels: DeliveryChannel[]
  read: boolean
  read_at: string | null
  created_at: string
  metadata: Record<string, any>
}

export interface AdminNotification extends Notification {
  user: {
    id: number
    email: string
    name: string
  }
  event_type: string
  event_id: string | null
  delivered: boolean
  delivered_at: string | null
}

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'booking_update' 
  | 'system' 
  | 'admin_message'

export type DeliveryChannel = 
  | 'in_app' 
  | 'email' 
  | 'sms' 
  | 'push' 
  | 'webhook'

export interface NotificationFormData {
  title: string
  message: string
  notification_type: NotificationType
  delivery_channels: DeliveryChannel[]
  metadata?: Record<string, any>
}

export interface BulkNotificationData {
  notification: NotificationFormData
  user_ids: number[]
  delivery_channels: DeliveryChannel[]
}

export interface NotificationStats {
  total: number
  unread: number
  delivered: number
  pending_delivery: number
  by_type: Record<NotificationType, number>
  by_event: Record<string, number>
  recent_24h: number
}

export interface DeliveryStats {
  total_notifications: number
  delivered_notifications: number
  pending_notifications: number
  channel_stats: Record<DeliveryChannel, {
    total: number
    delivered: number
    pending: number
  }>
  error_rate: number
}

export interface NotificationFilters {
  type?: NotificationType
  event_type?: string
  user_id?: number
  delivered?: boolean
  page?: number
  per_page?: number
}

export interface NotificationResponse {
  success: boolean
  notifications: Notification[]
  pagination: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
  unread_count: number
}

export interface AdminNotificationResponse {
  success: boolean
  notifications: AdminNotification[]
  pagination: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
  stats: NotificationStats
}

export interface BulkNotificationResult {
  user_id: number
  success: boolean
  notification_id?: number
  error?: string
}

export interface BulkNotificationResponse {
  success: boolean
  message: string
  results: BulkNotificationResult[]
  stats: {
    total: number
    successful: number
    failed: number
  }
}
