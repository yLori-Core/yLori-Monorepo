"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, HelpCircle } from "lucide-react"

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

interface EventRegistrationFormProps {
  questions: EventQuestion[]
  onSubmit: (answers: QuestionAnswer[]) => Promise<void>
  isLoading?: boolean
  eventTitle: string
}

export function EventRegistrationForm({ 
  questions, 
  onSubmit, 
  isLoading = false,
  eventTitle 
}: EventRegistrationFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    
    if (!validateForm()) {
      return
    }

    const questionAnswers: QuestionAnswer[] = questions.map(question => ({
      questionId: question.id,
      answer: answers[question.id] || (question.questionType === 'checkbox' ? [] : '')
    }))

    await onSubmit(questionAnswers)
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

  if (questions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Additional Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please answer the following questions to complete your registration for {eventTitle}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                'Registering...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Complete Registration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 