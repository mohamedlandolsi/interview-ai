import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Utility function to format dates consistently on server and client
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

const recentInterviews = [
  {
    id: "INT-001",
    candidate: "Sarah Wilson",
    position: "Frontend Developer",
    date: "2024-06-17",
    duration: "28 min",
    status: "completed",
    score: 85,
  },
  {
    id: "INT-002",
    candidate: "Michael Chen",
    position: "Product Manager",
    date: "2024-06-17",
    duration: "32 min",
    status: "completed",
    score: 92,
  },
  {
    id: "INT-003",
    candidate: "Emma Thompson",
    position: "Backend Developer",
    date: "2024-06-16",
    duration: "25 min",
    status: "completed",
    score: 78,
  },
  {
    id: "INT-004",
    candidate: "James Rodriguez",
    position: "UI/UX Designer",
    date: "2024-06-16",
    duration: "22 min",
    status: "in_progress",
    score: null,
  },
  {
    id: "INT-005",
    candidate: "Lisa Anderson",
    position: "Data Scientist",
    date: "2024-06-15",
    duration: "35 min",
    status: "pending",
    score: null,
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="success">Completed</Badge>
    case "in_progress":
      return <Badge variant="warning">In Progress</Badge>
    case "pending":
      return <Badge variant="secondary">Pending</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getScoreBadge = (score: number | null) => {
  if (score === null) return <span className="text-muted-foreground">—</span>
  
  if (score >= 90) return <Badge variant="success">{score}%</Badge>
  if (score >= 75) return <Badge variant="default">{score}%</Badge>
  return <Badge variant="warning">{score}%</Badge>
}

export function RecentInterviewsTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Interviews</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Interview ID</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentInterviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="font-mono text-sm">
                  {interview.id}
                </TableCell>
                <TableCell className="font-medium">
                  {interview.candidate}
                </TableCell>
                <TableCell>{interview.position}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(interview.date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {interview.duration}
                </TableCell>
                <TableCell>
                  {getStatusBadge(interview.status)}
                </TableCell>
                <TableCell>
                  {getScoreBadge(interview.score)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Download Report
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Share Results
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
