import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://spacelabs.pro'
  const currentDate = new Date()

  const staticPages = [
    { url: '', priority: 1, changefreq: 'weekly' as const },
    { url: '/about', priority: 0.9, changefreq: 'monthly' as const },
    { url: '/services', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/pricing', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/contact', priority: 0.8, changefreq: 'monthly' as const },
    { url: '/blog', priority: 0.8, changefreq: 'daily' as const },
    { url: '/careers', priority: 0.7, changefreq: 'weekly' as const },
    { url: '/faq', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/privacy', priority: 0.5, changefreq: 'monthly' as const },
    { url: '/terms', priority: 0.5, changefreq: 'monthly' as const },
  ]

  const services = [
    'web-development', 'mobile-apps', 'cloud-solutions', 'ai-consulting',
    'data-analytics', 'cybersecurity', 'devops', 'ui-ux-design',
    'api-development', 'blockchain', 'machine-learning', 'iot-solutions'
  ]

  const industries = [
    'healthcare', 'fintech', 'ecommerce', 'education', 'manufacturing',
    'retail', 'logistics', 'real-estate', 'travel', 'entertainment',
    'sports', 'food', 'fashion', 'automotive', 'energy'
  ]

  const technologies = [
    'react', 'nextjs', 'typescript', 'python', 'nodejs', 'aws',
    'docker', 'kubernetes', 'graphql', 'rest-api', 'mongodb', 'postgresql'
  ]

  const models = ['gpt', 'grok', 'gemini', 'claude', 'deepseek', 'llama', 'mistral']
  
  const tutorials = [
    'getting-started', 'quick-start', 'advanced-usage', 'api-reference',
    'deployment-guide', 'best-practices', 'troubleshooting', 'integration'
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  staticPages.forEach(page => {
    sitemapEntries.push({
      url: page.url ? `${baseUrl}${page.url}` : baseUrl,
      lastModified: currentDate,
      changeFrequency: page.changefreq,
      priority: page.priority,
    })
  })

  services.forEach(service => {
    sitemapEntries.push({
      url: `${baseUrl}/services/${service}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  industries.forEach(industry => {
    sitemapEntries.push({
      url: `${baseUrl}/industries/${industry}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  technologies.forEach(tech => {
    sitemapEntries.push({
      url: `${baseUrl}/technologies/${tech}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  models.forEach(model => {
    sitemapEntries.push({
      url: `${baseUrl}/models/${model}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  const modelPairs: string[] = []
  models.forEach(a => {
    models.forEach(b => {
      if (a !== b && !modelPairs.includes(`${b}-vs-${a}`)) {
        modelPairs.push(`${a}-vs-${b}`)
      }
    })
  })
  
  modelPairs.forEach(comparison => {
    sitemapEntries.push({
      url: `${baseUrl}/compare/${comparison}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  })

  tutorials.forEach(tutorial => {
    sitemapEntries.push({
      url: `${baseUrl}/tutorials/${tutorial}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  for (let i = 1; i <= 100; i++) {
    sitemapEntries.push({
      url: `${baseUrl}/blog/page/${i}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    })
  }

  return sitemapEntries
}
