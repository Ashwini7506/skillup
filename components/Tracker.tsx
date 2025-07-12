'use client';

import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { trackEvent } from '@/lib/mixpanelClient';

// Page configurations for your app structure
const pageConfigs: Record<string, { name: string; type: string; category: string }> = {
  // Root pages
  '/': { name: 'Home', type: 'landing_page', category: 'marketing' },
  
  // Protected pages
  '/createworkspace': { name: 'Create Workspace', type: 'onboarding', category: 'workspace_management' },
  '/onboarding': { name: 'Onboarding', type: 'onboarding', category: 'user_journey' },
  '/subscription-policies': { name: 'Subscription Policies', type: 'policies', category: 'legal' },
  '/workspace': { name: 'Workspace List', type: 'main_app', category: 'workspace_management' },
  
  // Dynamic workspace pages
  '/workspace/[workspaceId]': { name: 'Workspace Dashboard', type: 'main_app', category: 'workspace' },
  '/workspace/[workspaceId]/curate-projects': { name: 'Curate Projects', type: 'content_management', category: 'project_management' },
  '/workspace/[workspaceId]/discover': { name: 'Discover', type: 'content_discovery', category: 'skill_matching' },
  '/workspace/[workspaceId]/members': { name: 'Members', type: 'user_management', category: 'team_management' },
  '/workspace/[workspaceId]/portfolio': { name: 'Portfolio', type: 'profile_view', category: 'user_showcase' },
  '/workspace/[workspaceId]/projects': { name: 'Project Detail', type: 'project_view', category: 'project_management' },
  '/workspace/[workspaceId]/projects/[projectId]/[taskId]': { name: 'Task Detail', type: 'task_view', category: 'task_management' },
  '/workspace/[workspaceId]/settings': { name: 'Workspace Settings', type: 'settings', category: 'configuration' },
  '/workspace/[workspaceId]/subscription': { name: 'Subscription', type: 'billing', category: 'revenue' },
};

export default function Tracker() {
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    // Generate route pattern for dynamic routes
    const routePattern = pathname
      .replace(/\/workspace\/[^/]+/, '/workspace/[workspaceId]')
      .replace(/\/projects\/[^/]+/, '/projects/[projectId]')
      .replace(/\/portfolio\/[^/]+/, '/portfolio/[userId]')
      .replace(/\/discover\/[^/]+\/[^/]+/, '/discover/[role]/[level]')
      .replace(/\/[^/]+$/, pathname.includes('/workspace/') && pathname.split('/').length > 4 ? '/[taskId]' : pathname);

    // Get page config
    const config = pageConfigs[routePattern] || pageConfigs[pathname] || {
      name: 'Unknown Page',
      type: 'page',
      category: 'general'
    };

    // Extract dynamic parameters
    const dynamicProps: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        dynamicProps[key] = value;
      });
    }

    trackEvent(`${config.name} Visit`, {
      page_path: pathname,
      page_type: config.type,
      page_category: config.category,
      route_pattern: routePattern,
      timestamp: new Date().toISOString(),
      referrer: typeof window !== 'undefined' ? document.referrer : null,
      ...dynamicProps, // Include workspaceId, projectId, taskId, etc.
    });
  }, [pathname, params]);

  return null;
}