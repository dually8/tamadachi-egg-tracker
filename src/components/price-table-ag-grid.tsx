'use client';

import { Price } from '@/db/schema';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

type PriceTableProps = {
  prices: Price[];
};
export default function PriceTableAgGrid({ prices }: Readonly<PriceTableProps>) {
  const { systemTheme } = useTheme();
  const columnDefs: ColDef<Price>[] = useMemo(() => [
    {
      field: 'storeName',
      headerName: 'Store',
    },
    {
      field: 'storeLocation',
      headerName: 'Location',
    },
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: 'date',
      headerName: 'Date Checked',
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
      sort: 'desc',
    }
  ] as ColDef<Price>[], []);
  const defaultColDef: ColDef<Price> = useMemo(() => ({
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  }), []);
  return (
    <div data-ag-theme-mode={systemTheme} className="w-full h-150">
      <AgGridReact
        rowData={prices}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
      />
    </div>
  );
}
