import type { ChartConfig } from "@/components/ui/chart"

const chartConfig: ChartConfig = {
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
  duration: {
    label: "Duration",
    color: "#2563eb",
  },
  totalCost: {
    label: "Total Cost",
    color: "#2563eb",
  },
  averageCost: {
    label: "Average Cost",
    color: "#60a5fa",
  },
  totalCallsByDate: {
    label: "Total Amount of Calls",
    color: "#2563eb",
  },
  count: {
    label: "Count of calls",
    color: "#2563eb",
  },
}

export { chartConfig }