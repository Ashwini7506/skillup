import { formatDistanceToNow } from "date-fns";
import { ProfileAvatar } from "../profile-avatar";


export interface Activity {
    id : string;
    type:string;
    description : string;
    createdAt: Date;
    user:{
        name:string;
        image: string | null;
    }
}

interface ActivityFeedProps{
    activities:Activity[];
}


export const ActivityFeed =({activities}:ActivityFeedProps) => {
    return <div className="space-y-4">
        {activities?.map((activity)=>(
            <div key={activity.id} className="flex items-start gap-4">
                <ProfileAvatar url={activity.user.image || undefined} name={activity.user.name}
                numOfChars={2}
                size="lg"
                className="bg-blue-600"
                />

                <div className="flex flex-col">
                    <p className="text-sm">
                        <span className="font-meduim">
                            {activity.user.name}
                        </span>
                        {activity.description}
                    </p>
                    <span className="text-sx text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt),{
                            addSuffix:true,
                        })}
                    </span>
                </div>

            </div>
        ))}
    </div>
}