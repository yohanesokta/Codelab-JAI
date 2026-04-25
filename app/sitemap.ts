import { MetadataRoute } from 'next';
import { getProblems } from '@/app/actions/problem';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  
  // Fetch all public problems
  const problems = await getProblems();
  
  const problemEntries: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${baseUrl}/problem/${problem.id}`,
    lastModified: problem.createdAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...problemEntries,
  ];
}
