export interface CallFilters {
  startDate?: string
  endDate?: string
  callerName?: string
  callerNumber?: string
  receiverNumber?: string
  city?: string
  callDirection?: boolean | null
  callStatus?: boolean | null
  limit?: number
}
