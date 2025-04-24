// src/pages/admin/DateRangePicker.tsx
import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: value.from,
    to: value.to,
  })

  /* when user picks a range inside the calendar */
  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from && range?.to) onChange(range)
  }

  /* keep local state in-sync with parent */
  React.useEffect(() => {
    if (value?.from !== date?.from || value?.to !== date?.to) {
      setDate({ from: value.from, to: value.to })
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ────────────────────────────────────────────────────────── */
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} — {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
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
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />

          {/* quick-range shortcuts */}
          <div className="flex justify-end gap-2 p-3 border-t">
            {[
              { lbl: 'Last 7 days',  days: 7  },
              { lbl: 'Last 30 days', days: 30 },
              { lbl: 'This month',   month: true },
            ].map(({ lbl, days, month }) => (
              <Button
                key={lbl}
                size="sm"
                variant="outline"
                onClick={() => {
                  const now = new Date()
                  let from: Date
                  if (month) {
                    from = new Date(now.getFullYear(), now.getMonth(), 1)
                  } else {
                    from = new Date()
                    from.setDate(from.getDate() - (days ?? 0))
                  }
                  const range = { from, to: now }
                  setDate(range)
                  onChange(range)
                }}
              >
                {lbl}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
