import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ThemeToggle } from "./theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ProfileAvatar } from "./profile-avatar";
import { Separator } from "./ui/separator";

interface Props {
    id: string;
    name: string;
    email: string;
    image: string;
}

export const Navbar = ({ id, email, name, image }: Props) => {
    return (
        <nav className="w-full flex items-center justify-between p-4 bg-background border-b shadow-sm">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold">
                    Home
                    <span className="text-muted-foreground text-sm block">Manage your growth here</span>
                </h1>
            </div>
            <div className="flex items-center space-x-4">
                <Button variant={"ghost"} size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
                <ThemeToggle />
                <Popover>
                    <PopoverTrigger asChild>
                        <ProfileAvatar
                            url={image || undefined}
                            name={name} />
                    </PopoverTrigger>

                    <PopoverContent>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">{name}</h2>
                            <p className="text-sm text-muted-foreground">{email}</p>
                        </div>

                        <Separator />
                        <Button variant={"ghost"}>
                            <LogoutLink>
                                Sign Out
                            </LogoutLink>
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        </nav>
    );
}