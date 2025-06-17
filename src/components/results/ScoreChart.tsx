'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ScoreChartProps {
  data: Record<string, number>
}

export function ScoreChart({ data }: ScoreChartProps) {
  const chartData = Object.entries(data).map(([competency, score]) => ({
    competency: competency.length > 15 ? competency.substring(0, 12) + '...' : competency,
    score,
    fullName: competency
  }))

  const getBarColor = (score: number) => {
    if (score >= 90) return '#22c55e'
    if (score >= 80) return '#3b82f6'
    if (score >= 70) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="competency" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value, name, props) => [value, props.payload.fullName]}
            labelFormatter={(label) => `Score: ${label}`}
          />          <Bar 
            dataKey="score" 
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
