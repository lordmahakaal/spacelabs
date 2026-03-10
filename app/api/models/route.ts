import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const models = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Advanced language model for complex reasoning',
    strengths: ['Reasoning', 'Coding', 'Creative writing'],
    context_window: 128000,
    release_date: '2023-03-14'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Omni model with vision and audio capabilities',
    strengths: ['Multimodal', 'Speed', 'Vision'],
    context_window: 128000,
    release_date: '2024-05-13'
  },
  {
    id: 'grok-2',
    name: 'Grok-2',
    provider: 'xAI',
    description: 'AI assistant with real-time knowledge',
    strengths: ['Real-time info', 'Humor', 'Reasoning'],
    context_window: 131072,
    release_date: '2024-08-13'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Multimodal AI model from Google',
    strengths: ['Multimodal', 'Long context', 'Reasoning'],
    context_window: 1000000,
    release_date: '2023-12-06'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Advanced model for complex analysis',
    strengths: ['Analysis', 'Long context', 'Safety'],
    context_window: 200000,
    release_date: '2024-02-29'
  },
  {
    id: 'deepseek-v2',
    name: 'DeepSeek V2',
    provider: 'DeepSeek',
    description: 'Open-source model with strong reasoning',
    strengths: ['Open source', 'Reasoning', 'Code'],
    context_window: 128000,
    release_date: '2024-05-07'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Open-source large language model',
    strengths: ['Open source', 'Fine-tuning', 'Community'],
    context_window: 128000,
    release_date: '2024-04-18'
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'European AI model with strong performance',
    strengths: ['Reasoning', 'Multilingual', 'Speed'],
    context_window: 128000,
    release_date: '2024-02-26'
  }
]

export async function GET() {
  return NextResponse.json({
    success: true,
    count: models.length,
    models: models,
    last_updated: new Date().toISOString()
  })
}
