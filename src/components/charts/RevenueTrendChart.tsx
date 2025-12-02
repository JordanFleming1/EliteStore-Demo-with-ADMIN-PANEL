// Revenue Trend Chart Component
import React from 'react';
import { Line } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { Order } from '../../types/index';
import { defaultChartOptions, chartColors } from '../../utils/chartConfig';

interface RevenueTrendChartProps {
  orders: Order[];
  days?: number;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ 
  orders, 
  days = 7 
}) => {
  // Generate date range
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Calculate daily revenue
  const dailyRevenue = dateRange.map(date => {
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString() &&
             ['delivered', 'shipped', 'out_for_delivery'].includes(order.status);
    });
    
    return {
      date: format(date, 'MMM dd'),
      revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      orderCount: dayOrders.length
    };
  });

  const data = {
    labels: dailyRevenue.map(d => d.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: dailyRevenue.map(d => d.revenue),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: `Revenue Trend (Last ${days} Days)`,
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context: { dataIndex: number; parsed: { y: number } }) => {
            const dataIndex = context.dataIndex;
            const revenue = context.parsed.y;
            const orderCount = dailyRevenue[dataIndex].orderCount;
            return [
              `Revenue: $${revenue.toFixed(2)}`,
              `Orders: ${orderCount}`,
            ];
          },
        },
      },
    },
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales?.y,
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `$${value}`,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
};