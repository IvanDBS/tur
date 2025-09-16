// Types for admin panel

export interface AdminUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  admin: boolean
  banned: boolean
  created_at: string
  last_sign_in_at?: string
  sign_in_count?: number
  bookings_count?: number
  search_queries_count?: number
}

export interface AdminBooking {
  id: number
  user: AdminUser
  status: 'pending' | 'processing' | 'confirmed' | 'changed' | 'cancelled' | 'failed' | 'expired'
  operator_status?: string
  total_amount: number
  tour_details: {
    hotel?: {
      name: string
      category: string
      city: string
    }
    hotel_name?: string
    hotel_category?: string
    city?: string
    room_type?: string
    meal_plan?: string
    check_in?: string
    check_out?: string
    nights?: number | { total: number }
    adults?: number
    children?: number
    currency?: string
    tourists?: Array<{
      name: string
      category: string
      birthday: string
    }>
    flight_info?: {
      departure: {
        date: string
        time: string
        airport: string
        city: string
      }
      arrival: {
        date: string
        time: string
        airport: string
        city: string
      }
    }
  }
  customer_data?: {
    tourists?: Array<{
      id: string
      title: string
      firstName: string
      lastName: string
      birthDate: string
      passportNumber: string
      passportExpiry: string
      nationality: string
      fiscalCode: string
    }>
    selected_flight?: {
      outbound: {
        id: number
        name: string
        airline: {
          iata_code: string
          color: string
          airline: string
        }
        departure: {
          date: string
          time: string
        }
        arrival: {
          date: string
          time: string
        }
        airports: {
          from: {
            name: string
            prefix: string
          }
          to: {
            name: string
            prefix: string
          }
        }
      }
      inbound: {
        id: number
        name: string
        airline: {
          iata_code: string
          color: string
          airline: string
        }
        departure: {
          date: string
          time: string
        }
        arrival: {
          date: string
          time: string
        }
        airports: {
          from: {
            name: string
            prefix: string
          }
          to: {
            name: string
            prefix: string
          }
        }
      }
    }
  }
  created_at: string
  confirmed_at?: string
  cancelled_at?: string
  obs_booking_hash?: string
  obs_order_id?: string
  search_query?: {
    id: number
    obs_search_id: string
    created_at: string
  }
}

export interface AdminBookingsResponse {
  success: boolean
  message: string
  data: {
    bookings: AdminBooking[]
    pagination: {
      current_page: number
      total_pages: number
      total_count: number
      per_page: number
    }
  }
}

export interface AdminStats {
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  recent_bookings: number
  total_revenue: number
}

export interface AdminStatsResponse {
  success: boolean
  message: string
  data: {
    stats: AdminStats
  }
}

export interface AdminUsersResponse {
  success: boolean
  message: string
  data: {
    users: AdminUser[]
    pagination: {
      current_page: number
      total_pages: number
      total_count: number
      per_page: number
    }
  }
}

export interface AdminUserUpdateRequest {
  admin?: boolean
  banned?: boolean
}
