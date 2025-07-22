// app/(protected)/make-a-wish/page.tsx
// Remove 'use client' directive

import { getUserWorkspaces } from '@/app/data/workspace/get-user-workspace'
import MakeAWishClient from './make-a-wish-client'

const MakeAWishPage = async () => {
    // This runs on server
    const { data } = await getUserWorkspaces()
    
    // Pass data to client component
    return <MakeAWishClient workspaceData={data} />
}

export default MakeAWishPage
