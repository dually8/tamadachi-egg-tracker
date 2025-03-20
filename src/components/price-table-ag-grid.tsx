'use client';

import { Price } from '@/db/schema';
import { AllCommunityModule, ColDef, ModuleRegistry, colorSchemeDark, colorSchemeLight, themeQuartz } from 'ag-grid-community';
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
  const theme = useMemo(() => themeQuartz.withPart(systemTheme === 'dark' ? colorSchemeDark : colorSchemeLight), [systemTheme]);
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
      filter: 'agDateColumnFilter',
      filterValueGetter: (params) => new Date(params.data!.date),
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          const date = new Date(cellValue);
          if (date.getFullYear() === filterLocalDateAtMidnight.getFullYear() &&
              date.getMonth() === filterLocalDateAtMidnight.getMonth() &&
              date.getDate() === filterLocalDateAtMidnight.getDate()) {
            return 0;
          }
          return date.getTime() - filterLocalDateAtMidnight.getTime();
        }
      },
    }
  ] as ColDef<Price>[], []);
  const defaultColDef: ColDef<Price> = useMemo(() => ({
    sortable: true,
    filter: true,
    filterParams: {
      buttons: ['clear'],
    },
    flex: 1,
    minWidth: 100,
  }), []);
  return (
    <div className="w-full h-150">
      <AgGridReact
        theme={theme}
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
