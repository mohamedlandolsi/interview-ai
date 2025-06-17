'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Copy, MessageSquare, User } from 'lucide-react'

interface TranscriptEntry {
  timestamp: string
  speaker: string
  content: string
}

interface TranscriptViewerProps {
  transcript: TranscriptEntry[]
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const filteredTranscript = transcript.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const copyFullTranscript = async () => {
    const fullText = transcript.map(entry => 
      `[${entry.timestamp}] ${entry.speaker}: ${entry.content}`
    ).join('\n\n')
    
    try {
      await navigator.clipboard.writeText(fullText)
      setCopiedIndex(-1)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy transcript: ', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={copyFullTranscript}
          className="whitespace-nowrap"
        >
          <Copy className="h-4 w-4 mr-2" />
          {copiedIndex === -1 ? 'Copied!' : 'Copy All'}
        </Button>
      </div>

      {/* Transcript Content */}
      <ScrollArea className="h-96 border rounded-lg">
        <div className="p-4 space-y-4">
          {filteredTranscript.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transcript entries found</p>
            </div>
          ) : (
            filteredTranscript.map((entry, index) => (
              <div key={index} className="group relative">                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      entry.speaker === 'Interviewer' 
                        ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
                        : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                    }`}>
                      {entry.speaker === 'Interviewer' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        entry.speaker.charAt(0)
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={entry.speaker === 'Interviewer' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {entry.speaker}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {searchTerm && (                        <span dangerouslySetInnerHTML={{
                          __html: entry.content.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">$1</mark>'
                          )
                        }} />
                      ) || entry.content}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(entry.content, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedIndex === index && (
                      <span className="ml-1 text-xs">Copied!</span>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Summary */}
      <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
        <span>
          {filteredTranscript.length} of {transcript.length} entries
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        <span>
          Total duration: {transcript.length > 0 ? transcript[transcript.length - 1].timestamp : '00:00:00'}
        </span>
      </div>
    </div>
  )
}
