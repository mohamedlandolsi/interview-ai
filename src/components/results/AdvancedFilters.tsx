'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Filter, 
  X, 
  Calendar,
  MapPin,
  Star,
  Users,
  Clock,
  TrendingUp,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { format } from 'date-fns'

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void
  positions: string[]
  totalResults: number
}

export function AdvancedFilters({ onFiltersChange, positions, totalResults }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    searchTerm: '',
    positions: [] as string[],
    scoreRanges: [] as string[],
    dateRanges: [] as string[],
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const scoreRangeOptions = [
    { label: 'Excellent (90-100)', value: 'excellent' },
    { label: 'Good (80-89)', value: 'good' },
    { label: 'Average (70-79)', value: 'average' },
    { label: 'Poor (<70)', value: 'poor' }
  ]

  const dateRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: 'quarter' }
  ]

  const sortOptions = [
    { label: 'Interview Date', value: 'date' },
    { label: 'Overall Score', value: 'score' },
    { label: 'Candidate Name', value: 'name' },
    { label: 'Position', value: 'position' },
    { label: 'Duration', value: 'duration' }
  ]

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Count active filters
    let count = 0
    if (updatedFilters.searchTerm) count++
    if (updatedFilters.positions.length > 0) count++
    if (updatedFilters.scoreRanges.length > 0) count++
    if (updatedFilters.dateRanges.length > 0) count++
    
    setActiveFiltersCount(count)
    onFiltersChange(updatedFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      positions: [],
      scoreRanges: [],
      dateRanges: [],
      sortBy: 'date',
      sortOrder: 'desc' as 'asc' | 'desc'
    }
    setFilters(clearedFilters)
    setActiveFiltersCount(0)
    onFiltersChange(clearedFilters)
  }

  const toggleArrayFilter = (array: string[], value: string) => {
    return array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value]
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Advanced Filter Options</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Positions Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Positions</h3>
                    <div className="flex flex-wrap gap-2">
                      {positions.map(position => (
                        <Button
                          key={position}
                          variant={filters.positions.includes(position) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilters({
                            positions: toggleArrayFilter(filters.positions, position)
                          })}
                        >
                          {position}
                          {filters.positions.includes(position) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Score Ranges Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Score Ranges</h3>
                    <div className="flex flex-wrap gap-2">
                      {scoreRangeOptions.map(option => (
                        <Button
                          key={option.value}
                          variant={filters.scoreRanges.includes(option.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilters({
                            scoreRanges: toggleArrayFilter(filters.scoreRanges, option.value)
                          })}
                        >
                          {option.label}
                          {filters.scoreRanges.includes(option.value) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Date Ranges Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Date Ranges</h3>
                    <div className="flex flex-wrap gap-2">
                      {dateRangeOptions.map(option => (
                        <Button
                          key={option.value}
                          variant={filters.dateRanges.includes(option.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilters({
                            dateRanges: toggleArrayFilter(filters.dateRanges, option.value)
                          })}
                        >
                          {option.label}
                          {filters.dateRanges.includes(option.value) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sorting Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Sort By</h3>
                      <Select 
                        value={filters.sortBy} 
                        onValueChange={(value) => updateFilters({ sortBy: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">Sort Order</h3>
                      <div className="flex gap-2">
                        <Button
                          variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilters({ sortOrder: 'asc' })}
                        >
                          <SortAsc className="h-4 w-4 mr-1" />
                          Ascending
                        </Button>
                        <Button
                          variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilters({ sortOrder: 'desc' })}
                        >
                          <SortDesc className="h-4 w-4 mr-1" />
                          Descending
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Basic Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates, positions..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Quick Position Filter */}
          <Select 
            value={filters.positions[0] || 'all'} 
            onValueChange={(value) => updateFilters({ 
              positions: value === 'all' ? [] : [value] 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick Score Filter */}
          <Select 
            value={filters.scoreRanges[0] || 'all'} 
            onValueChange={(value) => updateFilters({ 
              scoreRanges: value === 'all' ? [] : [value] 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              {scoreRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {filters.searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{filters.searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ searchTerm: '' })}
                  />
                </Badge>
              )}
              
              {filters.positions.map(position => (
                <Badge key={position} variant="secondary" className="gap-1">
                  {position}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({
                      positions: filters.positions.filter(p => p !== position)
                    })}
                  />
                </Badge>
              ))}
              
              {filters.scoreRanges.map(range => (
                <Badge key={range} variant="secondary" className="gap-1">
                  {scoreRangeOptions.find(o => o.value === range)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({
                      scoreRanges: filters.scoreRanges.filter(r => r !== range)
                    })}
                  />
                </Badge>
              ))}
              
              {filters.dateRanges.map(range => (
                <Badge key={range} variant="secondary" className="gap-1">
                  {dateRangeOptions.find(o => o.value === range)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({
                      dateRanges: filters.dateRanges.filter(r => r !== range)
                    })}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {totalResults} results
          {filters.sortBy && (
            <span> • Sorted by {sortOptions.find(o => o.value === filters.sortBy)?.label} ({filters.sortOrder})</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
