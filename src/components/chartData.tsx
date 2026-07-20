import type { CallRecord } from '@/lib/call-utils'
import { averageCallTime } from '@/lib/call-utils'

export function getChartLengthData(data: CallRecord[]) {
  if (data.length === 0) return []

  const durations = data.map((call) => Number(call.callDuration))
  const longestCall = Math.max(...durations)
  const shortestCall = Math.min(...durations.filter((duration) => duration > 0))
  const avgCall = averageCallTime(data)

  return [
    { name: 'Longest', duration: longestCall },
    { name: 'Shortest', duration: shortestCall },
    { name: 'Average', duration: avgCall },
  ]
}

export function getChartCostData(data: CallRecord[]) {
  if (data.length === 0) return []

  const cityCosts: Record<string, { totalCost: number; count: number }> = {}

  data.forEach((call) => {
    if (!cityCosts[call.city]) {
      cityCosts[call.city] = { totalCost: 0, count: 0 }
    }
    cityCosts[call.city].totalCost += call.callCost
    cityCosts[call.city].count += 1
  })

  return Object.entries(cityCosts)
    .sort(([cityA], [cityB]) => cityA.localeCompare(cityB))
    .map(([city, { totalCost, count }]) => ({
      name: city,
      totalCost,
      averageCost: totalCost / count,
    }))
}

export function getChartCityCallData(data: CallRecord[]) {
  if (data.length === 0) return []

  const cityCalls: Record<string, number> = {}

  data.forEach((call) => {
    const city = call.city || 'Unknown'
    cityCalls[city] = (cityCalls[city] || 0) + 1
  })

  return Object.entries(cityCalls)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({ name, count }))
}

export function getChartCallsPerHour(data: CallRecord[]) {
  if (data.length === 0) return []

  const callsByHour: Record<string, number> = {}

  data.forEach((call) => {
    const dateObj = new Date(call.callStartTime)
    const hour =
      dateObj.toLocaleDateString() +
      ' ' +
      String(dateObj.getHours()).padStart(2, '0') +
      ':00'
    callsByHour[hour] = (callsByHour[hour] || 0) + 1
  })

  return Object.entries(callsByHour)
    .sort(([hourA], [hourB]) => hourA.localeCompare(hourB))
    .map(([hour, count]) => ({
      name: hour,
      calls: count,
    }))
}

export function getTableData(data: CallRecord[]) {
  if (data.length === 0) return []

  return data
    .slice()
    .sort(
      (a, b) =>
        new Date(b.callStartTime).getTime() - new Date(a.callStartTime).getTime(),
    )
    .slice(0, 10)
    .map((call) => ({
      callerName: call.callerName ?? 'Unknown',
      callerNumber: call.callerNumber ?? '',
      receiverNumber: call.receiverNumber ?? '',
      city: call.city ?? 'Unknown',
      duration: Number(call.callDuration) || 0,
      cost: call.callCost ?? 0,
      startTime: call.callStartTime,
    }))
}
