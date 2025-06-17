import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, Clock } from "lucide-react"

const stats = [
  {
    title: "Total Interviews",
    value: "1,234",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Users,
    description: "All time"
  },
  {
    title: "This Month",
    value: "157",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: Calendar,
    description: "Compared to last month"
  },
  {
    title: "Success Rate",
    value: "89.2%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Interview completion rate"
  },
  {
    title: "Avg Duration",
    value: "24 min",
    change: "-3.2%",
    changeType: "positive" as const,
    icon: Clock,
    description: "Average interview time"
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {stat.change}
              </span>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
