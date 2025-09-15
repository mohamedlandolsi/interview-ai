"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MoreHorizontal, ExternalLink, Eye } from "lucide-react"
import { useRecentInterviews } from "@/hooks/useRecentInterviews"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

export function RecentInterviewsTable() {
  const router = useRouter()
  const { 
    interviews, 
    loading, 
    error, 
    pagination, 
    nextPage, 
    prevPage, 
    retry 
  } = useRecentInterviews()

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'scheduled':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusDisplayText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'scheduled':
        return 'Scheduled'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status || 'Unknown'
    }
  }

  const formatSafeDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'No date'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  const handleViewDetails = (interviewId: string) => {
    router.push(`/interviews/${interviewId}`)
  }

  const handleViewResults = (interviewId: string) => {
    router.push(`/results/individual?interview=${interviewId}`)
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>
            Your latest interview sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load recent interviews. Please try again.
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retry}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Interviews
          </CardTitle>
          <CardDescription>
            Your latest interview sessions
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/interviews')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No interviews yet</h3>
            <p className="text-muted-foreground">
              Start your first interview to see it here.
            </p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/interviews')}
            >
              Create Interview
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">
                      {interview.candidateName || interview.candidateEmail || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      {interview.template?.title || 'No Template'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(interview.status)}>
                        {getStatusDisplayText(interview.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatSafeDate(interview.scheduledFor || interview.createdAt)}
                    </TableCell>
                    <TableCell>
                      {interview.overallScore !== null 
                        ? `${interview.overallScore}%`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(interview.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {interview.status === 'completed' && (
                            <DropdownMenuItem onClick={() => handleViewResults(interview.id)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Results
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {(pagination.hasNextPage || pagination.hasPreviousPage) && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} 
                  ({pagination.total} total interviews)
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={!pagination.hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
