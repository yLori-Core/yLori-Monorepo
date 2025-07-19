"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserPlus, HelpCircle } from "lucide-react"
import { handleRegisterWithAnswersAction, handleRegisterAction } from "@/app/events/[slug]/actions"
import { toast } from "sonner"

export interface EventQuestion {
  id: string
  question: string
  questionType: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio'
  options?: string[]
  isRequired: boolean
  order: number
}

export interface QuestionAnswer {
  questionId: string
  answer: string | string[]
}

interface EventRegistrationModalProps {
  questions: EventQuestion[]
  eventId: string
  eventSlug: string
  eventTitle: string
  trigger: React.ReactNode
}

export function EventRegistrationModal({ 
  questions, 
  eventId, 
  eventSlug, 
  eventTitle, 
  trigger 
}: EventRegistrationModalProps) {
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    questions.forEach(question => {
      if (question.isRequired) {
        const answer = answers[question.id]
        if (!answer || 
            (typeof answer === 'string' && !answer.trim()) ||
            (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = 'This field is required'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (questions.length > 0 && !validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      let result
      
      if (questions.length > 0) {
        const questionAnswers: QuestionAnswer[] = questions.map(question => ({
          questionId: question.id,
          answer: answers[question.id] || (question.questionType === 'checkbox' ? [] : '')
        }))
        result = await handleRegisterWithAnswersAction(eventId, eventSlug, questionAnswers)
      } else {
        await handleRegisterAction(eventId, eventSlug)
        result = { success: true }
      }

      if (result.success) {
        toast.success("Registration submitted successfully!")
        setOpen(false)
        setAnswers({})
        setErrors({})
        // Refresh the page to show updated registration status
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to register for event')
      }
    } catch (error) {
      toast.error('Failed to register for event')
    } finally {
      setIsLoading(false)
    }
  }

  const renderQuestion = (question: EventQuestion) => {
    const hasError = errors[question.id]
    const currentAnswer = answers[question.id]

    switch (question.questionType) {
      case 'text':
        return (
          <Input
            value={(currentAnswer as string) || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Your answer..."
            className={hasError ? 'border-destructive' : ''}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Your answer..."
            rows={3}
            className={hasError ? 'border-destructive' : ''}
          />
        )

      case 'select':
        return (
          <Select
            value={(currentAnswer as string) || ''}
            onValueChange={(value) => updateAnswer(question.id, value)}
          >
            <SelectTrigger className={hasError ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <RadioGroup
            value={(currentAnswer as string) || ''}
            onValueChange={(value) => updateAnswer(question.id, value)}
            className="space-y-2"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        const selectedOptions = (currentAnswer as string[]) || []
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateAnswer(question.id, [...selectedOptions, option])
                    } else {
                      updateAnswer(question.id, selectedOptions.filter(o => o !== option))
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {questions.length > 0 ? 'Complete Registration' : 'Register for Event'}
          </DialogTitle>
          {questions.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Please answer the following questions to complete your registration for {eventTitle}
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.length > 0 ? (
            <>
              {questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {question.question}
                    {question.isRequired && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderQuestion(question)}
                  {errors[question.id] && (
                    <p className="text-sm text-destructive">{errors[question.id]}</p>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                You're about to register for {eventTitle}. Click the button below to confirm.
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                'Registering...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {questions.length > 0 ? 'Complete Registration' : 'Register'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 