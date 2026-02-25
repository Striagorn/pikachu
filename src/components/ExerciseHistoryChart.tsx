'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ExerciseHistoryChartProps {
    data: any[]
}

export function ExerciseHistoryChart({ data }: ExerciseHistoryChartProps) {
    // Process data for chart: Date vs Max Weight of that session
    const chartData = data
        .map(session => {
            const weights = session.sets.map((s: any) => Number(s.weight)).filter((w: number) => w > 0)
            if (weights.length === 0) return null
            const maxWeight = Math.max(...weights)

            // session.date is a locale string from JS toLocaleDateString()
            // Try to parse it; fall back to raw value
            let label = session.date
            try {
                // Try parsing as a date (handles various locale formats)
                const parsed = new Date(session.date)
                if (!isNaN(parsed.getTime())) {
                    const day = parsed.getDate().toString().padStart(2, '0')
                    const month = (parsed.getMonth() + 1).toString().padStart(2, '0')
                    label = `${day}/${month}`
                } else {
                    // locale string like "25/2/2026" → take first two segments
                    const parts = session.date.replace(/\./g, '/').split('/')
                    if (parts.length >= 2) {
                        label = `${parts[0].padStart(2,'0')}/${parts[1].padStart(2,'0')}`
                    }
                }
            } catch {}

            return { date: label, weight: maxWeight }
        })
        .filter(Boolean)
        .reverse() // chronological order

    if (chartData.length === 0) return null

    const maxPR = Math.max(...chartData.map((d: any) => d.weight))

    return (
        <div className="h-[180px] w-full mt-4 mb-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8"
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        dy={8}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 5', 'dataMax + 10']}
                        tickFormatter={(v) => `${v}kg`}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '10px', 
                            border: 'none', 
                            background: '#1c1c1e', 
                            color: '#fff',
                            fontSize: '12px',
                            padding: '6px 10px'
                        }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`${value} kg`, 'Peso máx']}
                        labelFormatter={(label) => `Sesión ${label}`}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    {/* PR reference line */}
                    <ReferenceLine 
                        y={maxPR} 
                        stroke="#f59e0b" 
                        strokeDasharray="4 4" 
                        strokeWidth={1.5}
                        label={{ value: `PR ${maxPR}kg`, position: 'right', fontSize: 9, fill: '#f59e0b' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#8b5cf6"
                        strokeWidth={2.5} 
                        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
