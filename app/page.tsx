import { Button } from "@/components/ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-muted-foreground">
            Your personal Growthspace
          </h1>
          <h2 className="text-4xl md:text-5xl font-semibold mt-2">
            for <span className="text-blue-600">better productivity</span>
          </h2>

          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis id, natus quam dignissimos rem, 
            quisquam laboriosam consequatur totam mollitia culpa expedita eum neque sed delectus sint libero 
            cum porro voluptatibus!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {isLoggedIn ? (
              <Button asChild>
                <Link href="/workspace">Go to Growth space</Link>
              </Button>
            ) : (
              <>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <RegisterLink>Get Started</RegisterLink>
                </Button>
                <Button asChild variant="outline">
                  <LoginLink>Sign In</LoginLink>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
