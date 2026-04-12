'use client';

import { useState, useTransition } from 'react';
import type { DedupeDailyPricesResult } from '@/db/dedupe-daily-prices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type RemoveDuplicateDaysButtonProps = {
  onRemoveDuplicates: () => Promise<DedupeDailyPricesResult>;
};

export default function RemoveDuplicateDaysButton({
  onRemoveDuplicates,
}: Readonly<RemoveDuplicateDaysButtonProps>) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClick() {
    const confirmed = window.confirm(
      'Delete older duplicate records for each store, location, and day? This keeps only the most recent check for each day.',
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    startTransition(() => {
      void onRemoveDuplicates()
        .then((result) => {
          setMessage(result.message);
        })
        .catch((error: unknown) => {
          setMessage(null);
          setErrorMessage(
            error instanceof Error ? error.message : 'Failed to remove duplicate day records.',
          );
        });
    });
  }

  return (
    <Card className="mx-auto my-4 w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Database Maintenance</CardTitle>
        <CardDescription>
          Remove duplicate daily records and keep only the latest check for each store and location.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={handleClick} disabled={isPending} variant="destructive">
          {isPending ? 'Removing duplicates...' : 'Remove duplicate days'}
        </Button>
        {message ? <p className="text-sm">{message}</p> : null}
        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  );
}
