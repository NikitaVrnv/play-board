import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CustomDateRange } from "@/types"

// Explicitly define props without extending HTMLAttributes to avoid onChange conflict
interface DateRangePickerProps {
  value: CustomDateRange;
  onChange: (date: CustomDateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<CustomDateRange>({
    from: value.from,
    to: value.to,
  })

  const handleSelect = (range: any) => {
    if (range?.from && range?.to) {
      const newRange = { from: range.from, to: range.to }
      setDate(newRange)
      onChange(newRange)
    }
  }

  React.useEffect(() => {
    if (value?.from !== date?.from || value?.to !== date?.to) {
      setDate({ from: value.from, to: value.to })
    }
  }, [value])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
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
            selected={{ from: date.from, to: date.to }}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Set to last 7 days
                const to = new Date()
                const from = new Date()
                from.setDate(from.getDate() - 7)
                const range = { from, to }
                setDate(range)
                onChange(range)
              }}
            >
              Last 7 days
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Set to last 30 days
                const to = new Date()
                const from = new Date()
                from.setDate(from.getDate() - 30)
                const range = { from, to }
                setDate(range)
                onChange(range)
              }}
            >
              Last 30 days
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Set to current month
                const now = new Date()
                const from = new Date(now.getFullYear(), now.getMonth(), 1)
                const to = new Date()
                const range = { from, to }
                setDate(range)
                onChange(range)
              }}
            >
              This month
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}