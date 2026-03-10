import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-static'

const modelData: Record<string, any> = {
  'gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Advanced language model for complex reasoning tasks',
    strengths: ['Advanced reasoning', 'Code generation', 'Creative writing', 'Analysis'],
    weaknesses: ['Higher cost', 'Slower than GPT-4o'],
    context_window: 128000,
    pricing: '$0.03/1K input'
  },
  'grok-2': {
    name: 'Grok-2',
    provider: 'xAI',
    description: 'AI assistant with real-time knowledge and wit',
    strengths: ['Real-time knowledge', 'Humor', 'Reasoning', 'Lower cost'],
    weaknesses: ['Smaller context', 'Less established'],
    context_window: 131072,
    pricing: '$0.004/1K input'
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Multimodal AI model with massive context',
    strengths: ['Multimodal', '1M context window', 'Google ecosystem', 'Low cost'],
    weaknesses: ['Less creative', 'Google-specific'],
    context_window: 1000000,
    pricing: '$0.00125/1K input'
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Advanced model with longest context and safety',
    strengths: ['200K context', 'Analysis', 'Safety', 'Long documents'],
    weaknesses: ['Higher cost', 'Less coding'],
    context_window: 200000,
    pricing: '$0.015/1K input'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const { model } = await params
  const models = model.split('-vs-')
  
  if (models.length !== 2) {
    return NextResponse.json({
      success: false,
      error: 'Invalid comparison format. Use: /compare/model1-vs-model2',
      example: '/compare/gpt-4-vs-grok-2'
    }, { status: 400 })
  }

  const [model1Id, model2Id] = models
  const model1 = modelData[model1Id]
  const model2 = modelData[model2Id]

  if (!model1 || !model2) {
    return NextResponse.json({
      success: false,
      error: 'One or both models not found',
      available: Object.keys(modelData)
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    comparison: {
      model1: { id: model1Id, ...model1 },
      model2: { id: model2Id, ...model2 },
      summary: {
        winner: model1.context_window > model2.context_window ? model1Id : model2Id,
        common_strengths: model1.strengths.filter((s: string) => model2.strengths.includes(s)),
        key_difference: model1.pricing < model2.pricing ? `${model1Id} is more cost-effective` : `${model2Id} is more cost-effective`
      }
    }
  })
}
