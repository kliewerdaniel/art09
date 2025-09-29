// Mental Health Assessments - PHQ-9 and GAD-7 Forms
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { auth, assessments, User } from '@/lib/pocketbase'
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3,
  Heart,
  Shield
} from 'lucide-react'

interface AssessmentResponse {
  questionId: string
  value: number
}

interface AssessmentFormData {
  assessment_type: 'phq9' | 'gad7' | 'combined'
  responses: AssessmentResponse[]
}

const PHQ9_QUESTIONS = [
  {
    id: 'phq1',
    text: 'Little interest or pleasure in doing things',
    category: 'Interest/Pleasure'
  },
  {
    id: 'phq2',
    text: 'Feeling down, depressed, or hopeless',
    category: 'Mood'
  },
  {
    id: 'phq3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    category: 'Sleep'
  },
  {
    id: 'phq4',
    text: 'Feeling tired or having little energy',
    category: 'Energy'
  },
  {
    id: 'phq5',
    text: 'Poor appetite or overeating',
    category: 'Appetite'
  },
  {
    id: 'phq6',
    text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
    category: 'Self-esteem'
  },
  {
    id: 'phq7',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    category: 'Concentration'
  },
  {
    id: 'phq8',
    text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
    category: 'Psychomotor'
  },
  {
    id: 'phq9',
    text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
    category: 'Suicidal ideation'
  }
]

const GAD7_QUESTIONS = [
  {
    id: 'gad1',
    text: 'Feeling nervous, anxious, or on edge',
    category: 'Nervousness'
  },
  {
    id: 'gad2',
    text: 'Not being able to stop or control worrying',
    category: 'Control'
  },
  {
    id: 'gad3',
    text: 'Worrying too much about different things',
    category: 'Worry'
  },
  {
    id: 'gad4',
    text: 'Trouble relaxing',
    category: 'Relaxation'
  },
  {
    id: 'gad5',
    text: 'Being so restless that it is hard to sit still',
    category: 'Restlessness'
  },
  {
    id: 'gad6',
    text: 'Becoming easily annoyed or irritable',
    category: 'Irritability'
  },
  {
    id: 'gad7',
    text: 'Feeling afraid as if something awful might happen',
    category: 'Fear'
  }
]

const RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all', description: '0 days' },
  { value: 1, label: 'Several days', description: '1-7 days' },
  { value: 2, label: 'More than half the days', description: '8-14 days' },
  { value: 3, label: 'Nearly every day', description: '15+ days' }
]

const SEVERITY_LEVELS = {
  phq9: [
    { min: 0, max: 4, level: 'none', label: 'Minimal depression', color: 'bg-green-500' },
    { min: 5, max: 9, level: 'mild', label: 'Mild depression', color: 'bg-yellow-500' },
    { min: 10, max: 14, level: 'moderate', label: 'Moderate depression', color: 'bg-orange-500' },
    { min: 15, max: 19, level: 'moderately_severe', label: 'Moderately severe depression', color: 'bg-red-500' },
    { min: 20, max: 27, level: 'severe', label: 'Severe depression', color: 'bg-red-700' }
  ],
  gad7: [
    { min: 0, max: 4, level: 'none', label: 'Minimal anxiety', color: 'bg-green-500' },
    { min: 5, max: 9, level: 'mild', label: 'Mild anxiety', color: 'bg-yellow-500' },
    { min: 10, max: 14, level: 'moderate', label: 'Moderate anxiety', color: 'bg-orange-500' },
    { min: 15, max: 21, level: 'severe', label: 'Severe anxiety', color: 'bg-red-500' }
  ]
}

export default function AssessmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [assessmentType, setAssessmentType] = useState<'phq9' | 'gad7' | 'combined'>('combined')
  const [responses, setResponses] = useState<AssessmentResponse[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [previousAssessments, setPreviousAssessments] = useState<any[]>([])

  const totalSteps = assessmentType === 'combined' ? 3 : 2

  useEffect(() => {
    checkAuthAndLoadHistory()
  }, [])

  const checkAuthAndLoadHistory = async () => {
    if (!auth.isAuthenticated) {
      router.push('/sign-in')
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      router.push('/sign-in')
      return
    }

    setUser(currentUser)
    await loadAssessmentHistory()
  }

  const loadAssessmentHistory = async () => {
    try {
      const history = await assessments.getByUser(user!.id)
      setPreviousAssessments(history.items as unknown as any[])
    } catch (error) {
      console.error('Error loading assessment history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId)
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, value } : r)
      }
      return [...prev, { questionId, value }]
    })
  }

  const calculateScore = (type: 'phq9' | 'gad7') => {
    const questions = type === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS
    const typeResponses = responses.filter(r =>
      questions.some(q => q.id === r.questionId)
    )
    return typeResponses.reduce((sum, r) => sum + r.value, 0)
  }

  const getSeverityLevel = (score: number, type: 'phq9' | 'gad7') => {
    const levels = SEVERITY_LEVELS[type]
    return levels.find(level => score >= level.min && score <= level.max) || levels[0]
  }

  const handleSubmit = async () => {
    const questions = assessmentType === 'phq9' ? PHQ9_QUESTIONS :
                     assessmentType === 'gad7' ? GAD7_QUESTIONS :
                     [...PHQ9_QUESTIONS, ...GAD7_QUESTIONS]

    if (responses.length < questions.length) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const phq9Score = assessmentType !== 'gad7' ? calculateScore('phq9') : 0
      const gad7Score = assessmentType !== 'phq9' ? calculateScore('gad7') : 0
      const totalScore = phq9Score + gad7Score

      const phq9Severity = phq9Score > 0 ? getSeverityLevel(phq9Score, 'phq9') : null
      const gad7Severity = gad7Score > 0 ? getSeverityLevel(gad7Score, 'gad7') : null

      const overallRisk = totalScore >= 20 ? 'high' :
                         totalScore >= 10 ? 'medium' : 'low'

      const assessmentData = {
        user: user!.id,
        assessment_type: assessmentType,
        assessment_date: new Date().toISOString(),
        responses: JSON.stringify(responses),
        phq9_score: phq9Score,
        phq9_severity: (phq9Severity?.level || 'none') as 'none' | 'mild' | 'moderate' | 'moderately_severe' | 'severe',
        gad7_score: gad7Score,
        gad7_severity: (gad7Severity?.level || 'none') as 'none' | 'mild' | 'moderate' | 'severe',
        total_score: totalScore,
        overall_risk_level: overallRisk as 'low' | 'medium' | 'high' | 'crisis',
        crisis_resources_provided: overallRisk === 'high',
        follow_up_needed: overallRisk !== 'low',
        admin_reviewed: false,
        is_complete: true
      }

      await assessments.create(assessmentData)

      setResults({
        phq9Score,
        gad7Score,
        totalScore,
        phq9Severity,
        gad7Severity,
        overallRisk,
        requiresReview: overallRisk === 'high'
      })

      setShowResults(true)
      toast({
        title: "Assessment Completed",
        description: "Your mental health assessment has been saved successfully.",
      })

      await loadAssessmentHistory()
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast({
        title: "Submission Failed",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const startAssessment = (type: 'phq9' | 'gad7' | 'combined') => {
    setAssessmentType(type)
    setCurrentStep(1)
    setResponses([])
    setShowResults(false)
    setResults(null)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderQuestion = (question: any, index: number) => (
    <div key={question.id} className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
          {index + 1}
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-1">{question.text}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Over the last 2 weeks, how often have you been bothered by:
          </p>
        </div>
      </div>

      <RadioGroup
        value={responses.find(r => r.questionId === question.id)?.value?.toString() || ''}
        onValueChange={(value) => handleResponseChange(question.id, parseInt(value))}
        className="space-y-2"
      >
        {RESPONSE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
            <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                <span className="text-sm text-muted-foreground">{option.description}</span>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Assessment Complete</h2>
        <p className="text-muted-foreground">
          Thank you for completing your mental health assessment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.phq9Score > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                PHQ-9 Depression Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {results.phq9Score}/27
                </div>
                <Badge variant={results.phq9Severity?.level === 'none' ? 'default' : 'destructive'}>
                  {results.phq9Severity?.label}
                </Badge>
              </div>
              <Progress
                value={(results.phq9Score / 27) * 100}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground text-center">
                {results.phq9Severity?.label}
              </p>
            </CardContent>
          </Card>
        )}

        {results.gad7Score > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                GAD-7 Anxiety Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {results.gad7Score}/21
                </div>
                <Badge variant={results.gad7Severity?.level === 'none' ? 'default' : 'destructive'}>
                  {results.gad7Severity?.label}
                </Badge>
              </div>
              <Progress
                value={(results.gad7Score / 21) * 100}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground text-center">
                {results.gad7Severity?.label}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {results.requiresReview && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Follow-up Recommended
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <p className="mb-4">
              Based on your responses, we recommend connecting with a mental health professional.
              Your well-being is important to us.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Crisis Resources:</strong></p>
              <p>• National Suicide Prevention Lifeline: 988</p>
              <p>• Crisis Text Line: Text HOME to 741741</p>
              <p>• Mental Health America: 1-800-969-6642</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setShowResults(false)}>
          Take Another Assessment
        </Button>
        <Button onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessments...</p>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Assessment Results</h1>
            <p className="text-muted-foreground">Your mental health assessment results</p>
          </div>
        </div>
        {renderResults()}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Mental Health Assessment</h1>
          <p className="text-muted-foreground">
            Take standardized assessments to track your wellbeing
          </p>
        </div>
      </div>

      {/* Assessment Type Selection */}
      {currentStep === 1 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Choose Assessment Type
            </CardTitle>
            <CardDescription>
              Select which assessment(s) you'd like to take
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  assessmentType === 'phq9' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAssessmentType('phq9')}
              >
                <CardHeader>
                  <CardTitle className="text-lg">PHQ-9</CardTitle>
                  <CardDescription>Depression Assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    9 questions to assess symptoms of depression over the past 2 weeks
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  assessmentType === 'gad7' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAssessmentType('gad7')}
              >
                <CardHeader>
                  <CardTitle className="text-lg">GAD-7</CardTitle>
                  <CardDescription>Anxiety Assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    7 questions to assess symptoms of anxiety over the past 2 weeks
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  assessmentType === 'combined' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAssessmentType('combined')}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Combined</CardTitle>
                  <CardDescription>Full Assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Both PHQ-9 and GAD-7 assessments for comprehensive evaluation
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={nextStep}>
                Start Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Questions */}
      {(currentStep === 2 || currentStep === 3) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {currentStep === 2 && assessmentType === 'combined' && 'PHQ-9 Depression Assessment'}
                  {currentStep === 3 && 'GAD-7 Anxiety Assessment'}
                  {assessmentType === 'phq9' && 'PHQ-9 Depression Assessment'}
                  {assessmentType === 'gad7' && 'GAD-7 Anxiety Assessment'}
                </CardTitle>
                <CardDescription>
                  Answer each question based on your experience over the last 2 weeks
                </CardDescription>
              </div>
              <Badge variant="outline">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {currentStep === 2 && (
                <>
                  {assessmentType !== 'gad7' &&
                    PHQ9_QUESTIONS.map((question, index) => renderQuestion(question, index))
                  }
                </>
              )}

              {currentStep === 3 && (
                <>
                  {assessmentType !== 'phq9' &&
                    GAD7_QUESTIONS.map((question, index) => renderQuestion(question, index))
                  }
                </>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={prevStep} disabled={currentStep <= 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Assessments */}
      {previousAssessments.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Assessment History
            </CardTitle>
            <CardDescription>
              Your previous mental health assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousAssessments.slice(0, 5).map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">
                        {assessment.assessment_type} Assessment
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assessment.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Score: {assessment.total_score}</p>
                    <Badge variant={assessment.overall_risk_level === 'high' ? 'destructive' : 'secondary'}>
                      {assessment.overall_risk_level} risk
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
