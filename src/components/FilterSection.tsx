export interface CallFilters {
  startDate?: string
  endDate?: string
  callerName?: string
  callerNumber?: string
  receiverNumber?: string
  city?: string
  callDirection?: boolean | null
  callStatus?: boolean | null
  limit?: number
}

interface FilterSectionProps {
  filters: CallFilters
  onFiltersChange: (filters: CallFilters) => void
  userRole?: 'ANALYST' | 'ADMIN' | null
}

export function FilterSection({ filters, onFiltersChange, userRole }: FilterSectionProps) {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    })
  }

  const handleTextChange = (
    field: 'callerName' | 'callerNumber' | 'receiverNumber' | 'city',
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    })
  }

  const handleSelectChange = (field: 'callDirection' | 'callStatus', value: string) => {
    const filterValue = value === '' ? null : value === 'true' ? true : false
    onFiltersChange({
      ...filters,
      [field]: filterValue,
    })
  }

  const handleReset = () => {
    onFiltersChange({})
  }

  return (
    <div className="p-6 border-b">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-foreground"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-foreground"
          />
        </div>

        {userRole === 'ADMIN' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Caller Name</label>
            <input
              type="text"
              placeholder="Search caller..."
              value={filters.callerName || ''}
              onChange={(e) => handleTextChange('callerName', e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}

        {userRole === 'ADMIN' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Caller Number</label>
            <input
              type="text"
              placeholder="Search caller..."
              value={filters.callerNumber || ''}
              onChange={(e) => handleTextChange('callerNumber', e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}

        {userRole === 'ADMIN' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Receiver Number</label>
            <input
              type="text"
              placeholder="Search receiver..."
              value={filters.receiverNumber || ''}
              onChange={(e) => handleTextChange('receiverNumber', e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">City</label>
          <input
            type="text"
            placeholder="Search city..."
            value={filters.city || ''}
            onChange={(e) => handleTextChange('city', e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Items Per Page</label>
          <select
            value={filters.limit || 25}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                limit: parseInt(e.target.value, 10),
              })
            }
            className="rounded-md border bg-background px-3 py-2 text-foreground"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="25">25 (Max)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Direction</label>
          <select
            value={filters.callDirection === null ? '' : filters.callDirection === true ? 'true' : 'false'}
            onChange={(e) => handleSelectChange('callDirection', e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-foreground"
          >
            <option value="">All Directions</option>
            <option value="true">Outbound</option>
            <option value="false">Inbound</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={filters.callStatus === null ? '' : filters.callStatus === true ? 'true' : 'false'}
            onChange={(e) => handleSelectChange('callStatus', e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-foreground"
          >
            <option value="">All Statuses</option>
            <option value="true">Answered</option>
            <option value="false">Unanswered</option>
          </select>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <button
            onClick={handleReset}
            className="rounded-md border px-4 py-2 font-medium transition hover:bg-muted"
            type="button"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}
