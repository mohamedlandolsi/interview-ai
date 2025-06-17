import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

export interface InterviewResult {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  interviewDate: Date
  duration: number
  overallScore: number
  status: string
  metrics: Record<string, number>
  transcriptPreview: string
  aiInsights: string[]
  competencyScores: Record<string, number>
}

export const exportToPDF = async (results: InterviewResult[], filename: string = 'interview-results') => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Add title
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Interview Results Report', margin, yPosition)
  yPosition += 15

  // Add generation date
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, margin, yPosition)
  yPosition += 20

  // Add summary
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Summary', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const avgScore = Math.round(results.reduce((acc, r) => acc + r.overallScore, 0) / results.length || 0)
  const highPerformers = results.filter(r => r.overallScore >= 80).length
  
  pdf.text(`Total Interviews: ${results.length}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Average Score: ${avgScore}`, margin, yPosition)
  yPosition += 6
  pdf.text(`High Performers (80+): ${highPerformers}`, margin, yPosition)
  yPosition += 20

  // Add individual results
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Individual Results', margin, yPosition)
  yPosition += 15

  for (const result of results) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = margin
    }

    // Candidate info
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(result.candidateName, margin, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Position: ${result.position}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Date: ${format(result.interviewDate, 'MMM dd, yyyy')}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Duration: ${result.duration} minutes`, margin, yPosition)
    yPosition += 6
    pdf.text(`Overall Score: ${result.overallScore}/100`, margin, yPosition)
    yPosition += 10

    // Metrics
    pdf.text('Key Metrics:', margin, yPosition)
    yPosition += 6
    Object.entries(result.metrics).forEach(([key, value]) => {
      pdf.text(`  • ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`, margin + 10, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // AI Insights
    pdf.text('AI Insights:', margin, yPosition)
    yPosition += 6
    result.aiInsights.forEach(insight => {
      const lines = pdf.splitTextToSize(`  • ${insight}`, pageWidth - margin * 2 - 10)
      pdf.text(lines, margin + 10, yPosition)
      yPosition += lines.length * 5
    })
    yPosition += 15
  }

  // Save the PDF
  pdf.save(`${filename}.pdf`)
}

export const exportToCSV = (results: InterviewResult[], filename: string = 'interview-results') => {
  const headers = [
    'Candidate Name',
    'Email',
    'Position',
    'Interview Date',
    'Duration (min)',
    'Overall Score',
    'Status',
    'Technical',
    'Communication',
    'Problem Solving',
    'Cultural Fit',
    'Top Insight'
  ]

  const csvData = results.map(result => [
    result.candidateName,
    result.candidateEmail,
    result.position,
    format(result.interviewDate, 'yyyy-MM-dd'),
    result.duration.toString(),
    result.overallScore.toString(),
    result.status,
    result.metrics.technical?.toString() || 'N/A',
    result.metrics.communication?.toString() || 'N/A',
    result.metrics.problemSolving?.toString() || 'N/A',
    result.metrics.culturalFit?.toString() || 'N/A',
    result.aiInsights[0] || 'No insights available'
  ])

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field.replace(/"/g, '""')}"` 
          : field
      ).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportElementToPDF = async (elementId: string, filename: string = 'report') => {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
