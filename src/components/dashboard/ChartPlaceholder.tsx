import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChartPlaceholder({ title, height = "h-64" }: { title: string; height?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${height} bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20`}>
          <div className="text-center space-y-2">
            <div className="text-muted-foreground">📊</div>
            <p className="text-sm text-muted-foreground">Chart placeholder</p>
            <p className="text-xs text-muted-foreground">
              Integration with charting library coming soon
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
