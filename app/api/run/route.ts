import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, prompt, options } = body

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }

    const availableModels = ['gpt-4', 'gpt-4o', 'grok-2', 'gemini-pro', 'claude-3-opus', 'deepseek-v2', 'llama-3-70b', 'mistral-large']
    const selectedModel = model || 'gpt-4'

    if (!availableModels.includes(selectedModel)) {
      return NextResponse.json({
        success: false,
        error: `Unknown model: ${selectedModel}. Available: ${availableModels.join(', ')}`
      }, { status: 400 })
    }

    const mockResponse = {
      success: true,
      model: selectedModel,
      prompt: prompt,
      response: `[Mock response from ${selectedModel}] This is a demonstration response. In production, this would call the actual AI model API.`,
      tokens_used: Math.floor(prompt.length / 4) + 100,
      processing_time_ms: Math.floor(Math.random() * 1000) + 500,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request body'
    }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Run API - POST with { model, prompt, options }',
    example: {
      model: 'gpt-4',
      prompt: 'Hello, how are you?',
      options: { temperature: 0.7 }
    },
    available_models: ['gpt-4', 'gpt-4o', 'grok-2', 'gemini-pro', 'claude-3-opus', 'deepseek-v2', 'llama-3-70b', 'mistral-large']
  })
}
