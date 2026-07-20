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
  TableCaption,
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
import { fetchCallList } from '@/api'
import type { CallRecord } from '@/lib/call-utils'
import {
  normalizeCallList,
  totalCallCost,
  averageCallTime,
  totalAnsweredCalls,
  totalUnansweredCalls,
} from './lib/call-utils'

import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from "recharts"
import { ThemeToggleButton } from "./components/ThemeToggle"

function App() {
  const [data, setData] = useState<CallRecord[]>([])
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchCallList()
      .then((res) => {
        setData(normalizeCallList(res))
      })
      .catch((err) => {
        setError(err)
      })
  }, [])

  // Stores the functions into variables
  const totalCost = totalCallCost(data)
  const answeredCount = totalAnsweredCalls(data)
  const chartLengthData = getChartLengthData(data)
  const chartCostData = getChartCostData(data)
  const chartCityCallData = getChartCityCallData(data)
  const chartCallsPerHour = getChartCallsPerHour(data)
  const tableData = getTableData(data)

  // Theme (dark mode) state: initialize from localStorage or system preference
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
    <><div className="p-6 grid md:grid-cols-2 gap-4 text-center">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Error loading data: {error.message}
        </div>
      ) : null}

      <Card>
        <CardHeader className="text-center font-bold">
          <CardTitle>Total Calls Received</CardTitle>
          <CardDescription>The total amount of calls we have received</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{data.length}</p>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="font-bold">
          <CardTitle>Total Call Costs</CardTitle>
          <CardDescription>The total cost of all calls we have received</CardDescription>
        </CardHeader>
        <CardContent>
          <p>${totalCost.toFixed(2)}</p>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="font-bold">
          <CardTitle>Average Call Duration</CardTitle>
          <CardDescription>The average duration of all calls we have received</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{averageCallTime(data).toFixed(2)} seconds</p>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="font-bold">
          <CardTitle>Answered Calls</CardTitle>
          <CardDescription>How many calls were marked as answered</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{answeredCount} calls</p>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="font-bold">
          <CardTitle>Unanswered Calls</CardTitle>
          <CardDescription>How many calls were marked as unanswered</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{totalUnansweredCalls(data)} calls</p>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
    </div>
    <div className="p-4 grid md:grid-cols-2 gap-4 text-center">
      <Card size="sm">
        <CardHeader className="font-bold">
          <CardTitle>Call Duration Statistics</CardTitle>
          <CardDescription>Comparison of longest, shortest, and average call durations</CardDescription>
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
    <div className="p-6 space-y-10 text-center">
      <Card className="w-full">
        <CardHeader className="font-bold">Recent Calls</CardHeader>
        <CardDescription className="font-bold">A Table of Recent Calls Received</CardDescription>
        <CardContent>
          <Table>
            <TableCaption>Organised by time!</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Caller Name</TableHead>
                  <TableHead className="font-bold">Caller Number</TableHead>
                  <TableHead className="font-bold">Receiver Number</TableHead>
                  <TableHead className="font-bold">City</TableHead>
                  <TableHead className="font-bold">Duration</TableHead>
                  <TableHead className="font-bold">Cost</TableHead>
                  <TableHead className="font-bold">Start Time</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

  <ThemeToggleButton isDark={isDark} setIsDark={setIsDark} />
</div></>
  )
}

export default App
