'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', product: 186, social: 80 },
  { month: 'February', product: 305, social: 200 },
  { month: 'March', product: 237, social: 120 },
  { month: 'April', product: 73, social: 190 },
  { month: 'May', product: 209, social: 130 },
  { month: 'June', product: 214, social: 140 },
];

const chartConfig = {
  product: {
    label: 'Product Mentions',
    color: 'hsl(var(--chart-1))',
  },
  social: {
    label: 'Social Buzz',
    color: 'hsl(var(--chart-2))',
  },
};

export function TrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Trend Analysis</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="product" fill="var(--color-product)" radius={4} />
            <Bar dataKey="social" fill="var(--color-social)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
