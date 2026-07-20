export interface CallRecord {
  id?: string
  callerName: string
  callerNumber: string
  receiverNumber: string
  city: string
  callDirection: boolean
  callStatus: boolean
  callDuration: string
  callCost: number
  callStartTime: string
  callEndTime: string
}

export function normalizeCallRecord(raw: any): CallRecord {
  return {
    id: raw.id ?? raw.ID ?? "",
    callerName: raw.callerName ?? raw.caller_name ?? raw.caller ?? "",
    callerNumber: raw.callerNumber ?? raw.caller_number ?? raw.from ?? "",
    receiverNumber:
      raw.receiverNumber ?? raw.recieverNumber ?? raw.receiver_number ?? raw.to ?? "",
    city: raw.city ?? "",
    callDirection: Boolean(
      raw.callDirection ?? raw.call_direction ?? raw.direction,
    ),
    callStatus: Boolean(raw.callStatus ?? raw.call_status ?? raw.status),
    callDuration:
      String(raw.callDuration ?? raw.call_duration ?? raw.duration ?? ""),
    callCost: Number(raw.callCost ?? raw.call_cost ?? raw.cost ?? 0),
    callStartTime:
      String(
        raw.callStartTime ?? raw.call_start_time ?? raw.start_time ?? "",
      ),
    callEndTime:
      String(raw.callEndTime ?? raw.call_end_time ?? raw.end_time ?? ""),
  }
}

export function normalizeCallList(rawData: any[]): CallRecord[] {
  return rawData.map(normalizeCallRecord)
}

export function totalCallCost(calls: CallRecord[]): number {
  return calls.reduce((sum, call) => sum + call.callCost, 0)
}

export function averageCallTime(calls: CallRecord[]): number {
  if (calls.length === 0) return 0
  const total = calls.reduce((sum, call) => sum + Number(call.callDuration), 0)
  return total / calls.length
}

export function totalAnsweredCalls(calls: CallRecord[]): number {
  return calls.filter((call) => call.callStatus).length
}

export function totalUnansweredCalls(calls: CallRecord[]): number {
  return calls.filter((call) => call.callStatus === false).length
}