// src/pages/admin/DateRangePicker.tsx
import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange, className }: Props) {
  const [internal, setInternal] = React.useState<DateRange>({
    from: value.from,
    to: value.to,
  });

  const pick = (range?: DateRange) => {
    setInternal(range!);
    if (range?.from && range?.to) onChange(range);
  };

  React.useEffect(() => {
    if (value.from !== internal.from || value.to !== internal.to) {
      setInternal({ from: value.from, to: value.to });
    }
  }, [value]);

  const quick = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    pick({ from, to });
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !internal && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {internal?.from ? (
              internal.to ? (
                <>
                  {format(internal.from, 'LLL dd, y')} – {format(internal.to, 'LLL dd, y')}
                </>
              ) : (
                format(internal.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={internal?.from}
            selected={internal}
            onSelect={pick}
            numberOfMonths={2}
          />

          <div className="flex justify-end gap-2 p-3 border-t">
            <Button size="sm" variant="outline" onClick={() => quick(7)}>
              Last 7 days
            </Button>
            <Button size="sm" variant="outline" onClick={() => quick(30)}>
              Last 30 days
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const now = new Date();
                pick({ from: new Date(now.getFullYear(), now.getMonth(), 1), to: now });
              }}
            >
              This month
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
