
export const fetcher = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
};

export const apiRoutes = {
  members: {
    search: (workspaceId: string, job?: string, role?: string) => {
      const params = new URLSearchParams({ workspaceId });
      if (job) params.append('job', job);
      if (role) params.append('role', role);
      return `/api/members/search?${params}`;
    },
    suggestions: (workspaceId: string) => `/api/members/suggestions?workspaceId=${workspaceId}`,
    accepted: (workspaceId: string) => `/api/members/accepted?workspaceId=${workspaceId}`,
    requests: (workspaceId: string) => `/api/members/requests?workspaceId=${workspaceId}`,
    send: () => '/api/members/send',
    updateRequest: () => '/api/members/requests',
    messages: () => '/api/members/messages',
    chat: (userId: string) => `/api/members/chat?userId=${userId}`,
  },
  
};
