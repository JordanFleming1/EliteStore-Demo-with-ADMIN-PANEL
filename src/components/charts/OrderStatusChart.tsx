// Order Status Distribution Chart
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { Order } from '../../types/index';
import { defaultChartOptions, chartColorArray } from '../../utils/chartConfig';

interface OrderStatusChartProps {
  orders: Order[];
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ orders }) => {
  // Calculate status distribution
  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing', 'packed'].includes(o.status)).length,
    shipped: orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => ['cancelled', 'returned', 'refunded'].includes(o.status)).length,
  };

  const data = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [
          statusCounts.pending,
          statusCounts.processing,
          statusCounts.shipped,
          statusCounts.delivered,
          statusCounts.cancelled,
        ],
        backgroundColor: chartColorArray,
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Order Status Distribution',
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context: { label: string; parsed: number }) => {
            const total = orders.length;
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};