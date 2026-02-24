'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ConsistencyChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
      return (
          <Card className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed">
              Sin datos suficientes
          </Card>
      )
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={10}
          />
          <Tooltip 
              cursor={{ fill: 'transparent' }} // No cursor highlight
              contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  background: 'rgba(30, 41, 59, 0.9)', 
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '8px 12px',
                  fontSize: '12px'
              }}
              itemStyle={{ padding: 0 }}
              labelStyle={{ display: 'none' }} // Hide label in tooltip
          />
          <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={24}>
              {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count >= 3 ? '#3b82f6' : '#e2e8f0'} // Blue for hit, slate-200 for miss
                    className="transition-all duration-300 hover:opacity-80"
                  />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
