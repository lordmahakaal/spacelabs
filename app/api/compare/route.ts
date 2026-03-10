import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-static'

const modelData: Record<string, any> = {
  'gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    strengths: ['Advanced reasoning', 'Code generation', 'Creative writing'],
    context_window: 128000,
    pricing: '$0.03/1K input, $0.06/1K output'
  },
  'grok-2': {
    name: 'Grok-2',
    provider: 'xAI',
    strengths: ['Real-time knowledge', 'Humor', 'Reasoning'],
    context_window: 131072,
    pricing: '$0.004/1K input, $0.012/1K output'
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    provider: 'Google',
    strengths: ['Multimodal', 'Long context', 'Google ecosystem'],
    context_window: 1000000,
    pricing: '$0.00125/1K input, $0.005/1K output'
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    strengths: ['Long context', 'Analysis', 'Safety'],
    context_window: 200000,
    pricing: '$0.015/1K input, $0.075/1K output'
  },
  'deepseek-v2': {
    name: 'DeepSeek V2',
    provider: 'DeepSeek',
    strengths: ['Open source', 'Strong reasoning', 'Code'],
    context_window: 128000,
    pricing: '$0.0014/1K input, $0.0028/1K output'
  },
  'llama-3-70b': {
    name: 'Llama 3 70B',
    provider: 'Meta',
    strengths: ['Open source', 'Fine-tuning', 'Community'],
    context_window: 128000,
    pricing: 'Free (self-hosted)'
  },
  'mistral-large': {
    name: 'Mistral Large',
    provider: 'Mistral AI',
    strengths: ['Reasoning', 'Multilingual', 'European'],
    context_window: 128000,
    pricing: '$0.008/1K input, $0.024/1K output'
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const model1 = searchParams.get('model1')
  const model2 = searchParams.get('model2')

  if (model1 && model2) {
    const data1 = modelData[model1]
    const data2 = modelData[model2]

    if (!data1 || !data2) {
      return NextResponse.json({
        success: false,
        error: 'One or both models not found',
        available_models: Object.keys(modelData)
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      comparison: {
        model1: { ...data1, id: model1 },
        model2: { ...data2, id: model2 },
        differences: {
          context_window_diff: data1.context_window - data2.context_window,
          common_strengths: data1.strengths.filter((s: string) => data2.strengths.includes(s))
        }
      }
    })
  }

  return NextResponse.json({
    success: true,
    models: Object.entries(modelData).map(([id, data]) => ({ id, ...data })),
    example: '/api/compare?model1=gpt-4&model2=grok-2'
  })
}
