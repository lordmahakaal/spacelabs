import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const workflows = [
  {
    id: 'content-generation',
    name: 'Content Generation',
    description: 'Generate blog posts, articles, and marketing content',
    steps: ['Topic input', 'Outline creation', 'Content writing', 'SEO optimization'],
    models: ['gpt-4', 'claude-3-opus'],
    category: 'content'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Automated code analysis and improvement suggestions',
    steps: ['Code submission', 'Static analysis', 'Security check', 'Best practices review'],
    models: ['gpt-4', 'deepseek-v2'],
    category: 'development'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Process and analyze datasets for insights',
    steps: ['Data upload', 'Cleaning', 'Analysis', 'Visualization'],
    models: ['gpt-4', 'gemini-pro'],
    category: 'analytics'
  },
  {
    id: 'multi-model-compare',
    name: 'Multi-Model Comparison',
    description: 'Compare responses across multiple AI models',
    steps: ['Query input', 'Model dispatch', 'Response collection', 'Comparison report'],
    models: ['gpt-4', 'grok-2', 'gemini-pro', 'claude-3-opus'],
    category: 'comparison'
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'AI-powered support automation',
    steps: ['Ticket intake', 'Intent classification', 'Response generation', 'Escalation'],
    models: ['gpt-4o', 'claude-3-opus'],
    category: 'support'
  },
  {
    id: 'document-summarization',
    name: 'Document Summarization',
    description: 'Summarize long documents and reports',
    steps: ['Document upload', 'Text extraction', 'Key points extraction', 'Summary generation'],
    models: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
    category: 'content'
  }
]

export async function GET() {
  return NextResponse.json({
    success: true,
    count: workflows.length,
    workflows: workflows,
    last_updated: new Date().toISOString()
  })
}
