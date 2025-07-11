import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import SkillUpLandingPage from "@/components/SkillUpLandingPage";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();

  return <SkillUpLandingPage isLoggedIn={!!isLoggedIn} />;
}