"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Price } from "@/db/schema";

type PriceTableProps = {
  prices: Price[];
};
export default function PriceTable({ prices }: Readonly<PriceTableProps>) {
  return (
    <Table>
      <TableCaption>Egg Prices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Store</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Date Checked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prices?.map((price) => (
          <TableRow key={price.id}>
            <TableCell>{price.storeName}</TableCell>
            <TableCell>{price.storeLocation}</TableCell>
            <TableCell>${price.price.toFixed(2)}</TableCell>
            <TableCell>{new Date(price.date).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}