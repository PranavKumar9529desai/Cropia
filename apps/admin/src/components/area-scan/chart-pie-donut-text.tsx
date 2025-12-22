"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, Cell } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@repo/ui/components/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@repo/ui/components/chart"

export const description = "Scan Analysis"


export function ScanResultChart({ chartData, chartConfig }: { chartData: { status: string; count: number; fill: string }[], chartConfig: ChartConfig }) {


    const totalScans = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.count, 0)
    }, [chartData])

    return (
        <Card className="flex flex-col w-full border-none shadow-none bg-transparent">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm font-medium">Scan Analysis</CardTitle>
                <CardDescription className="text-[10px]">{new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[200px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-popover p-2 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: data.fill }}
                                                />
                                                <span className="text-sm font-medium text-popover-foreground">
                                                    {data.status === 'healthy' ? 'Healthy' : 'Issues'}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-baseline gap-1 pl-4">
                                                <span className="text-lg font-bold text-popover-foreground">
                                                    {data.count}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    scans
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius="60%"
                            outerRadius="100%"
                            strokeWidth={5}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {totalScans.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 20}
                                                    className="fill-muted-foreground text-[10px]"
                                                >
                                                    Scans
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>

        </Card>
    )
}
