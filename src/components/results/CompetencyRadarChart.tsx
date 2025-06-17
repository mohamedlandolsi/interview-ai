'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface CompetencyRadarChartProps {
  data: Record<string, number>
}

export function CompetencyRadarChart({ data }: CompetencyRadarChartProps) {
  const chartData = Object.entries(data).map(([competency, score]) => ({
    competency: competency.length > 15 ? competency.substring(0, 12) + '...' : competency,
    score,
    fullName: competency
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="competency" 
            tick={{ fontSize: 12 }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={0} 
            domain={[0, 100]} 
            tick={{ fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.1}
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
