import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { chartConfig } from "./components/chartConfig"

import {
  getChartLengthData,
  getChartCostData,
  getChartCityCallData,
  getChartCallsPerHour,
  getTableData,
} from "./components/chartData"

import './App.css'
import { useEffect, useState } from 'react'
import {
  clearAuthToken,
  fetchCallList,
  fetchCallSummary,
  getAuthToken,
  getRoleFromToken,
  type CallSummary,
  type UserRole,
} from '@/api'
import type { CallRecord } from '@/lib/call-utils'
import {
  normalizeCallList,
} from './lib/call-utils'

import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from "recharts"
import { ThemeToggleButton } from "./components/ThemeToggle"
import { LoginModal } from "./components/LoginModal"
import { FilterSection, type CallFilters } from "./components/FilterSection"


function App() {
  const [allData, setAllData] = useState<CallRecord[]>([])  // For charts/summary (unfiltered)
  const [data, setData] = useState<CallRecord[]>([])  // For table (filtered)
  const [summary, setSummary] = useState<CallSummary>({
    totalCalls: 0,
    totalDuration: 0,
    totalCost: 0,
    avgCallDuration: 0,
    answeredCalls: 0,
    unansweredCalls: 0,
  })
  const [error, setError] = useState<Error | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getAuthToken()))
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => getRoleFromToken())
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme")
      if (stored) return stored === "dark"
      return (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
    } catch {
      return false
    }
  })
  const [filters, setFilters] = useState<CallFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load all unfiltered data for charts and summary
  const loadAllData = async () => {
    const res = await fetchCallList(undefined, 1)  // No filters
    if (res.pagination) {
      setAllData(normalizeCallList(res.data))
    } else {
      setAllData(normalizeCallList(res))
    }
  }

  // Load filtered data for table only
  const loadCallRecords = async (filtersParam?: CallFilters, pageParam: number = 1) => {
    const res = await fetchCallList(filtersParam, pageParam)
    // API returns { pagination: {...}, data: [...] }
    if (res.pagination) {
      setTotalPages(res.pagination.totalPages || 1)
      setData(normalizeCallList(res.data))
    } else {
      // Fallback for older response format
      setTotalPages(1)
      setData(normalizeCallList(res))
    }
  }

  const loadSummary = async () => {
    const res = await fetchCallSummary()
    setSummary(res)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setAllData([])
      setData([])
      setSummary({
        totalCalls: 0,
        totalDuration: 0,
        totalCost: 0,
        avgCallDuration: 0,
        answeredCalls: 0,
        unansweredCalls: 0,
      })
      setError(null)
      setCurrentPage(1)
      return
    }

    Promise.all([loadAllData(), loadSummary()]).catch((err) => {
      setError(err)
    })
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.all([loadCallRecords(filters, currentPage)]).catch((err) => {
      setError(err)
    })
  }, [isAuthenticated, filters, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleLoginSuccess = (role: UserRole | null) => {
    setIsAuthenticated(true)
    setCurrentRole(role)
  }

  const handleLogout = () => {
    clearAuthToken()
    setIsAuthenticated(false)
    setCurrentRole(null)
  }

  // Chart/table data
  const chartLengthData = getChartLengthData(allData)
  const chartCostData = getChartCostData(allData)
  const chartCityCallData = getChartCityCallData(allData)
  const chartCallsPerHour = getChartCallsPerHour(allData)
  const tableData = getTableData(data)

  useEffect(() => {
    try {
      if (isDark) document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", isDark ? "dark" : "light")
    } catch {
      // noop
    }
  }, [isDark])

  return (
    <>  
      {!isAuthenticated && <LoginModal onLoginSuccess={handleLoginSuccess} />}
      
      <header className="p-6 items-center justify-between text-center">
        <div>
          <h1 className="text-3xl font-bold">Call Analytics</h1>
          <p className="text-sm text-muted-foreground">Overview of recent call data given the API data</p>
        </div>
      </header>

      {isAuthenticated && (
          <section className="px-6 pb-2">
          <div className="mx-auto flex max-w-3xl items-center justify-between rounded-lg border p-4">
            <p className="text-sm">
              Authenticated as <span className="font-semibold">{currentRole ?? 'UNKNOWN'}</span>. Your token is stored in localStorage.
            </p>
            <button 
              className="rounded-md border px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition" 
              onClick={handleLogout} 
              type="button"
            >
              Log out
            </button>
          </div>
        </section>
      )}

      {isAuthenticated && (
        <>
          <div className="p-6 grid md:grid-cols-5 gap-4 text-center">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                Error loading data: {error.message}
              </div>
            ) : null}

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Total Calls Received</CardTitle>
                <CardDescription>The total amount of calls we have received</CardDescription>
              </CardHeader>
              <CardContent className="text-lg">
                <p>{summary.totalCalls}</p>
              </CardContent>
              <CardFooter>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Total Call Costs</CardTitle>
                <CardDescription>The total cost of all calls we have received</CardDescription>
              </CardHeader>
              <CardContent className="text-lg">
                <p>${summary.totalCost.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Average Call Duration</CardTitle>
                <CardDescription>The average duration of all calls we have received</CardDescription>
              </CardHeader>
              <CardContent className="text-lg">
                <p>{summary.avgCallDuration.toFixed(2)} seconds</p>
              </CardContent>
              <CardFooter>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Answered Calls</CardTitle>
                <CardDescription>How many calls were marked as answered</CardDescription>
              </CardHeader>
              <CardContent className="text-lg">
                <p>{summary.answeredCalls} calls</p>
              </CardContent>
              <CardFooter>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Unanswered Calls</CardTitle>
                <CardDescription>How many calls were marked as unanswered</CardDescription>
              </CardHeader>
              <CardContent className="text-lg">
                <p>{summary.unansweredCalls} calls</p>
              </CardContent>
              <CardFooter>
              </CardFooter>
            </Card>
          </div>

          <div className="p-4 grid md:grid-cols-2 gap-4 text-center">
            <Card size="sm">
              <CardHeader className="font-bold">
                <CardTitle>Call Duration Statistics</CardTitle>
                <CardDescription>Comparison of longest, shortest, and average call durations (that aren't zero seconds)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart width={600} height={300} data={chartLengthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <Bar dataKey="duration" fill="#8884d8" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Call Cost Statistics</CardTitle>
                <CardDescription>Comparison of total call costs per city, as well as the average cost per call</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart width={600} height={300} data={chartCostData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <Bar dataKey="totalCost" fill={chartConfig.totalCost.color} />
                    <Bar dataKey="averageCost" fill={chartConfig.averageCost.color} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Calls By Day</CardTitle>
                <CardDescription>The average total calls by day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart width={600} height={300} data={chartCallsPerHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <Line dataKey="calls" stroke={chartConfig.totalCallsByDate.color} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-bold">
                <CardTitle>Totals Calls Per City</CardTitle>
                <CardDescription>The total amount of calls per city that we received</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart width={600} height={300} data={chartCityCallData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <Bar dataKey="count" fill={chartConfig.count.color} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <FilterSection 
            filters={filters} 
            onFiltersChange={setFilters} 
            userRole={currentRole}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <div className="p-6 space-y-10 text-center">
            <Card className="w-full">
              <CardHeader className="font-bold">Table of Calls</CardHeader>
              <CardDescription className="font-bold">A Table of Data that can be filtered above to search according to your role</CardDescription>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Caller Name</TableHead>
                      <TableHead className="font-bold">Caller Number</TableHead>
                      <TableHead className="font-bold">Receiver Number</TableHead>
                      <TableHead className="font-bold">City</TableHead>
                      <TableHead className="font-bold">Duration</TableHead>
                      <TableHead className="font-bold">Cost</TableHead>
                      <TableHead className="font-bold">Start Time</TableHead>
                      <TableHead className="font-bold">End Time</TableHead>
                      <TableHead className="font-bold">Answered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.callerName}</TableCell>
                        <TableCell>{row.callerNumber}</TableCell>
                        <TableCell>{row.receiverNumber}</TableCell>
                        <TableCell>{row.city}</TableCell>
                        <TableCell>{row.duration}</TableCell>
                        <TableCell>${row.cost.toFixed(2)}</TableCell>
                        <TableCell>{new Date(row.startTime).toLocaleString()}</TableCell>
                        <TableCell>{new Date(row.endTime).toLocaleString()}</TableCell>
                        <TableCell>{row.answered ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <ThemeToggleButton isDark={isDark} setIsDark={setIsDark} />

      <footer className="text-center">
        <p>Built with TypeScript, Vite/React, and shadcn components.</p>
        <p>&copy; Jack Bates 2026</p>
      </footer>
    </>
  )
}

export default App
