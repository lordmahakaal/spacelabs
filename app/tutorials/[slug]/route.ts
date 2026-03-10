import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-static'

const tutorials: Record<string, any> = {
  'getting-started': {
    title: 'Getting Started',
    description: 'Learn the basics of Spacelabs platform',
    steps: [
      'Visit https://spacelabs.pro',
      'Explore available AI models',
      'Try the API endpoints',
      'Run your first query'
    ],
    difficulty: 'beginner',
    estimated_time: '5 minutes'
  },
  'quick-start': {
    title: 'Quick Start Guide',
    description: 'Get up and running in minutes',
    steps: [
      'Choose your AI model',
      'Make your first API call',
      'Compare results',
      'Build your workflow'
    ],
    difficulty: 'beginner',
    estimated_time: '10 minutes'
  },
  'advanced-usage': {
    title: 'Advanced Usage',
    description: 'Master advanced features and optimizations',
    steps: [
      'Set up custom workflows',
      'Configure model parameters',
      'Implement caching',
      'Scale your application'
    ],
    difficulty: 'advanced',
    estimated_time: '1 hour'
  },
  'api-reference': {
    title: 'API Reference',
    description: 'Complete API documentation',
    endpoints: [
      { method: 'GET', path: '/api/models', description: 'List all available models' },
      { method: 'GET', path: '/api/workflows', description: 'List all workflows' },
      { method: 'POST', path: '/api/run', description: 'Run AI model' },
      { method: 'GET', path: '/api/compare', description: 'Compare models' }
    ],
    difficulty: 'intermediate',
    estimated_time: '30 minutes'
  },
  'deployment-guide': {
    title: 'Deployment Guide',
    description: 'Deploy your AI applications to production',
    steps: [
      'Set up environment variables',
      'Configure SSL/TLS',
      'Set up monitoring',
      'Configure auto-scaling'
    ],
    difficulty: 'advanced',
    estimated_time: '2 hours'
  },
  'best-practices': {
    title: 'Best Practices',
    description: 'Follow industry best practices',
    topics: [
      'Rate limiting',
      'Error handling',
      'Cost optimization',
      'Security'
    ],
    difficulty: 'intermediate',
    estimated_time: '45 minutes'
  },
  'troubleshooting': {
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    issues: [
      { problem: 'API returns 500', solution: 'Check model availability' },
      { problem: 'Slow response', solution: 'Use closer region or smaller model' },
      { problem: 'Rate limit exceeded', solution: 'Implement exponential backoff' }
    ],
    difficulty: 'beginner',
    estimated_time: '15 minutes'
  },
  'integration': {
    title: 'Integration Guide',
    description: 'Integrate with your existing tools',
    integrations: ['REST API', 'Webhooks', 'SDK', 'CLI'],
    steps: [
      'Get API key',
      'Choose integration method',
      'Follow guides',
      'Test thoroughly'
    ],
    difficulty: 'intermediate',
    estimated_time: '1 hour'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  if (slug) {
    const tutorial = tutorials[slug]
    if (!tutorial) {
      return NextResponse.json({
        success: false,
        error: 'Tutorial not found',
        available: Object.keys(tutorials)
      }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      tutorial: { id: slug, ...tutorial }
    })
  }

  return NextResponse.json({
    success: true,
    count: Object.keys(tutorials).length,
    tutorials: Object.entries(tutorials).map(([id, data]) => ({ id, ...data })),
    last_updated: new Date().toISOString()
  })
}
