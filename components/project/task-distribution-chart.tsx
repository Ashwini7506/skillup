"use client"

import { useEffect, useState } from "react";
import { Pie, PieChart, Label } from "recharts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface TaskDistributionProps {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

const chartConfig = {
  tasks: { label: "Tasks" },
  completed: { label: "Completed", color: "hsl(var(--chart-1))" },
  inProgress: { label: "In Progress" },
  overdue: { label: "Overdue" },
  todo: { label: "Todo" },
} satisfies ChartConfig;

export const TaskDistributionChart = ({ tasks }: TaskDistributionProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  const data = [
    { name: "Completed", value: tasks.completed || 0, fill: "#22c55e" },
    { name: "In progress", value: tasks.inProgress || 0, fill: "#f59e0b" },
    { name: "Overdue", value: tasks.overdue || 0, fill: "red" },
    {
      name: "Todo",
      value: Math.max(0, tasks.total - (tasks.completed || 0) - (tasks.inProgress || 0) - (tasks.overdue || 0)),
      fill: "#3b82f6",
    },
  ].filter((item) => item.value > 0 && !isNaN(item.value));

  useEffect(() => {
    setHasMounted(true);

    const updateTextColor = () => {
      const isDarkTheme = document.documentElement.classList.contains('dark');
      const textElements = document.querySelectorAll('.recharts-text tspan');
      textElements.forEach((element) => {
        element.setAttribute('class', isDarkTheme ? 'text-white' : 'text-black');
      });
    };

    updateTextColor();
    window.addEventListener('theme-change', updateTextColor);
    return () => window.removeEventListener('theme-change', updateTextColor);
  }, []);

  if (!hasMounted) return null;

  if (data.length === 0) {
    return <div>No data to display</div>;
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Task Distribution</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart width={300} height={300}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              strokeWidth={50}
            >
              <Label
                content={({ cx, cy }) => {
                  if (cx && cy) {
                    const centerX = typeof cx === "string" ? parseInt(cx, 10) / 100 * 300 : cx;
                    const centerY = typeof cy === "string" ? parseInt(cy, 10) / 100 * 300 : cy;
                    const innerRadius = 60;
                    const adjustedY = centerY - (innerRadius / 2);
                    return (
                      <text
                        x={centerX}
                        y={adjustedY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={centerX}
                          y={adjustedY}
                          className="text-3xl font-bold"
                        >
                          {tasks.total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={centerX}
                          y={adjustedY + 24}
                          className="fill-muted-foreground"
                        >
                          Tasks
                        </tspan>
                      </text>
                    );
                  }
                  return (
                    <text x="125" y="120" textAnchor="middle" dominantBaseline="middle">
                      <tspan className="text-3xl font-bold fill-muted-foreground">{tasks.total.toLocaleString()}</tspan>
                      <tspan x="125" y="145" className="fill-muted-foreground">Tasks</tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <div className="flex items-center justify-center w-full">
          <p className="text-center">
            Total tasks for the project
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};
