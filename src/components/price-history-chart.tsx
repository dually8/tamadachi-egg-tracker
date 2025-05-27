'use client';
import { Price } from '@/db/schema';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

// X axis is time
// Y axis is price

type PriceHistoryChartProps = {
  title: string;
  data: Price[];
}
export default function PriceHistoryChart(props: Readonly<PriceHistoryChartProps>) {
  const { systemTheme } = useTheme();

  const options = useMemo<AgChartOptions>(() => ({
    theme: systemTheme === 'dark' ? 'ag-default-dark' : 'ag-default',
    title: {
      text: props.title,
    },
    data: props.data.map(item => ({
      price: item.price,
      date: new Date(item.date) // Ensure date is a Date object
    })),
    series: [{
      type: 'line',
      xKey: 'date',
      yKey: 'price',
      yName: 'Price',
    }],
    axes: [
      {
        type: 'time',
        position: 'bottom',
        label: {
          formatter: (params) => new Date(params.value).toLocaleDateString(),
        },
        title: {
          text: 'Date',
        },
      },
      {
        type: 'number',
        position: 'left',
        label: {
          formatter: (params) => `$${params.value.toFixed(2)}`,
        },
        title: {
          text: 'Price',
        },
      }
    ],
  }), [props.title, props.data, systemTheme]);
  return (
    <div className='py-2'>
      <AgCharts options={options} />
    </div>
  );
}