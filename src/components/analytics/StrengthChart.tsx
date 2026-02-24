'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StrengthChart({ data, exerciseName }: { data: any[], exerciseName: string }) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed">
                Sin historial para {exerciseName}
            </Card>
        )
    }

  return (
    <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
            />
            <YAxis 
                hide // Clean look, value in tooltip
                domain={['dataMin - 5', 'dataMax + 10']}
            />
            <Tooltip 
                contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    background: 'rgba(30, 41, 59, 0.9)', 
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                    fontSize: '12px'
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                formatter={(value: any) => [`${value} kg`, 'Max Weight']}
            />
            <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#ef4444" // Apple Health Red
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
    </div>
  )
}
