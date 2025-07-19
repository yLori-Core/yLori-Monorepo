"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EventQuestion {
  id?: string
  question: string
  questionType: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio'
  options?: string[]
  isRequired: boolean
  order: number
}

interface EventQuestionsManagerProps {
  questions: EventQuestion[]
  onChange: (questions: EventQuestion[]) => void
  showHeader?: boolean
  hideAddButton?: boolean
}

export function EventQuestionsManager({ questions, onChange, showHeader = true, hideAddButton = false }: EventQuestionsManagerProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  const addQuestion = () => {
    const newQuestion: EventQuestion = {
      question: "",
      questionType: "text",
      isRequired: false,
      order: questions.length,
    }
    onChange([...questions, newQuestion])
    setExpandedQuestions(prev => new Set([...prev, questions.length]))
  }

  const updateQuestion = (index: number, updates: Partial<EventQuestion>) => {
    const updatedQuestions = questions.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    )
    onChange(updatedQuestions)
  }

  const removeQuestion = (index: number) => {
    const filteredQuestions = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order: i }))
    onChange(filteredQuestions)
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const reorderedQuestions = [...questions]
    const [movedQuestion] = reorderedQuestions.splice(fromIndex, 1)
    reorderedQuestions.splice(toIndex, 0, movedQuestion)
    
    // Update order numbers
    const updatedQuestions = reorderedQuestions.map((q, i) => ({ ...q, order: i }))
    onChange(updatedQuestions)
  }

  const toggleExpanded = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex]
    const newOptions = [...(question.options || []), ""]
    updateQuestion(questionIndex, { options: newOptions })
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex]
    const newOptions = [...(question.options || [])]
    newOptions[optionIndex] = value
    updateQuestion(questionIndex, { options: newOptions })
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex]
    const newOptions = (question.options || []).filter((_, i) => i !== optionIndex)
    updateQuestion(questionIndex, { options: newOptions })
  }

  const needsOptions = (type: string) => {
    return ['select', 'multiselect', 'checkbox', 'radio'].includes(type)
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <HelpCircle className="h-5 w-5 opacity-70" />
              Custom Questions
            </h3>
            <p className="text-sm text-muted-foreground">
              Add custom questions to collect additional information from attendees
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      )}
      
      {!showHeader && !hideAddButton && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      )}

      {questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <HelpCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No custom questions yet</p>
            <p className="text-sm text-muted-foreground">
              Add questions to gather more information from your attendees
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => {
            const isExpanded = expandedQuestions.has(index)
            
            return (
              <Card key={index} className={cn("transition-all", isExpanded && "shadow-md")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="cursor-move">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(index)}
                        className="text-left w-full"
                      >
                        <div className="font-medium">
                          {question.question || `Question ${index + 1}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {question.questionType} • {question.isRequired ? 'Required' : 'Optional'}
                        </div>
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Question Text */}
                      <div>
                        <label className="text-sm font-medium">Question</label>
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(index, { question: e.target.value })}
                          placeholder="Enter your question..."
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Question Type */}
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select
                            value={question.questionType}
                            onValueChange={(value: any) => updateQuestion(index, { 
                              questionType: value,
                              options: needsOptions(value) ? [''] : undefined
                            })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Short Text</SelectItem>
                              <SelectItem value="textarea">Long Text</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="radio">Multiple Choice</SelectItem>
                              <SelectItem value="checkbox">Checkboxes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Required Toggle */}
                        <div>
                          <label className="text-sm font-medium">Required</label>
                          <Select
                            value={question.isRequired ? "true" : "false"}
                            onValueChange={(value) => updateQuestion(index, { isRequired: value === "true" })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="false">Optional</SelectItem>
                              <SelectItem value="true">Required</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Options for select/radio/checkbox */}
                      {needsOptions(question.questionType) && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Options</label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(index)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(index, optionIndex)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 