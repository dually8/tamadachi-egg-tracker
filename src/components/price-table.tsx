'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Price } from '@/db/schema';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';

type PriceTableProps = {
  prices: Price[];
};
export default function PriceTable({ prices }: Readonly<PriceTableProps>) {
  const columns = useMemo<ColumnDef<Price>[]>(
    () => [
      {
        accessorKey: 'storeName',
        header: 'Store',
      },
      {
        accessorKey: 'storeLocation',
        header: 'Location',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: (info) => `$${info.getValue<number>().toFixed(2)}`,
      },
      {
        accessorKey: 'date',
        header: 'Date Checked',
        cell: (info) => new Date(info.getValue<string>()).toLocaleString(),
      },
    ],
    [],
  );
  const table = useReactTable({
    data: prices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <Table>
      <TableCaption>Egg Prices</TableCaption>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : (
                  <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => {
              return (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
