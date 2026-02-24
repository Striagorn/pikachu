'use client'

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ExerciseHistoryChartProps {
    data: any[]
}

export function ExerciseHistoryChart({ data }: ExerciseHistoryChartProps) {
    // Process data for chart: Date vs Max Weight of that session
    const chartData = data.map(session => {
        const maxWeight = Math.max(...session.sets.map((s: any) => Number(s.weight)))
        // Short date format DD/MM
        const dateParts = session.date.split('-') // Assuming DD-MM-YYYY or similar from date string
        // Actually session.date is locale date string, might vary. 
        // Best to parse it or use raw date if available. 
        // For now let's try to just use the first two parts if it's DD/MM/YYYY
        
        return {
            date: session.date.substring(0, 5), 
            weight: maxWeight
        }
    }).reverse() // Reverse to show chronological order (oldest to newest)

    if (chartData.length < 2) return null

    return (
        <div className="h-[150px] w-full mt-4 mb-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <XAxis 
                        dataKey="date" 
                        hide 
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            background: '#1c1c1e', 
                            color: '#fff',
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`${value} kg`, '']}
                        labelStyle={{ display: 'none' }}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#8b5cf6" // Primary Purple
                        strokeWidth={2} 
                        dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
