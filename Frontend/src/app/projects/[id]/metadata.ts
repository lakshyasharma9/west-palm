import type { Metadata } from 'next';
import { getProjectById, getS3ImageUrl } from '@/lib/api';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const project = await getProjectById(params.id);
    
    if (!project) {
      return {
        title: 'Project Not Found | WPCS',
        description: 'The requested project could not be found.',
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wpcs.com';
    const projectUrl = `${siteUrl}/projects/${params.id}`;
    const imageUrl = getS3ImageUrl(project.bannerUrl) || `${siteUrl}/placeholder.jpg`;

    return {
      title: `${project.name} | WPCS Projects`,
      description: project.overview?.vision || project.address || `${project.type} project by West Palm Construction Solutions`,
      keywords: `${project.type}, ${project.name}, construction project, BIM, VDC, West Palm Construction`,
      alternates: {
        canonical: projectUrl,
      },
      openGraph: {
        title: project.name,
        description: project.overview?.vision || project.address,
        images: [imageUrl],
        type: 'website',
        url: projectUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: project.name,
        description: project.overview?.vision || project.address,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Project | WPCS',
      description: 'West Palm Construction Solutions project',
    };
  }
}
