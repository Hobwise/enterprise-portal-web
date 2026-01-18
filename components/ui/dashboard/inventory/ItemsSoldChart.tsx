'use client';

import React from 'react';
import { Card } from '@nextui-org/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ItemSold } from './mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ItemsSoldChartProps {
  data: ItemSold[];
  className?: string;
}

const ItemsSoldChart: React.FC<ItemsSoldChartProps> = ({ data, className }) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: 'Stock Percentage',
        data: data.map((item) => item.stockPercentage),
        backgroundColor: '#5F35D2',
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}`,
          stepSize: 25,
        },
        grid: {
          color: '#E5E7EB',
        },
        title: {
          display: true,
          text: 'Stock Percentage',
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Sales Items',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Card shadow="sm" className={`rounded-xl ${className}`}>
      <div className="border-b  border-gray-200 p-4">
        <h3 className="font-semibold text-lg">Items Sold from the Menu</h3>
      </div>
      <div className="p-4" style={{ height: '350px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default ItemsSoldChart;
