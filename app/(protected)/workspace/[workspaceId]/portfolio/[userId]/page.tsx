import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Calendar, Users, Trophy, Target, Lightbulb, Github, Linkedin, FileText, ExternalLink } from 'lucide-react';
import { RatingDialog } from '@/components/portfolio/RatingDialog';
import { calculateDecisionMaker, calculateStrategicThinker, calculateTeamMaker, formatDate, getDifficultyColor } from '@/lib/utils';
import { UserPortfolio } from '@/utils/types';
import { db } from '@/lib/db';
import Tracker from '@/components/Tracker';

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

async function getUserPortfolio(userId: string): Promise<UserPortfolio | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        createdProjects: {
          where: { visibility: 'PUBLIC' }
        },
        joinRequests: {
          where: { status: 'ACCEPTED' },
          include: { project: true }
        },
        tasks: true,
        activities: true
      }
    });

    if (!user) {
      console.warn('User not found for ID:', userId);
      return null;
    }

    return user as unknown as UserPortfolio;
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    return null;
  }
}

// Helper function to get user metadata from activities
function getUserMetadata(activities: any[]) {
  const latestActivity = activities
    .filter(activity => activity.type === 'PROFILE_UPDATED' && activity.metadata)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  
  return latestActivity?.metadata || {};
}

export default async function Portfolio({ params }: PageProps) {
  const {userId} = await params;
  const user = await getUserPortfolio(userId);

  if (!user) {
    notFound();
  }

  const metadata = getUserMetadata(user.activities);

  // Debug logging
  // console.log('User object keys:', Object.keys(user));
  // console.log('Metadata:', metadata);
  // console.log('User activities count:', user.activities.length);

  const skills = {
    strategicThinker: calculateStrategicThinker(user.tasks, user.id),
    teamMaker: calculateTeamMaker(user.joinRequests),
    decisionMaker: calculateDecisionMaker(user.skillRatings || [])
  };

  // Get social links from either user object or metadata
  const socialLinks = {
    linkedinUrl: user.linkedinUrl || metadata.linkedinUrl || null,
    githubUrl: user.githubUrl || metadata.githubUrl || null,
    resumeUrl: user.resumeUrl || metadata.resumeUrl || null
  };

  // Get about from either user object or metadata
  const aboutText = user.about || metadata.about || metadata.bio || null;

  // Debug social links
  console.log('Social links:', socialLinks);
  console.log('About text:', aboutText);

  // Temporary test data - remove this after debugging
  // const testSocialLinks = {
  //   linkedinUrl: socialLinks.linkedinUrl || 'https://linkedin.com/in/test',
  //   githubUrl: socialLinks.githubUrl || 'https://github.com/test',
  //   resumeUrl: socialLinks.resumeUrl || 'https://example.com/resume.pdf'
  // };

  // const testAboutText = aboutText || 'Passionate Product Manager with experience in building innovative solutions and leading cross-functional teams to deliver exceptional user experiences.';

  return (
    <div className="min-h-screen bg-white">
      <Tracker />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h1>
                <p className="text-xl text-gray-600 mb-4">{user.job}</p>
                
                {/* Bio/About section - moved here */}
                {aboutText && (
                  <p className="text-gray-700 leading-relaxed mb-4 max-w-2xl">
                    {aboutText}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {user.role}
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    <Users className="w-4 h-4 mr-1" />
                    {user.joinRequests.length} Collaborations
                  </Badge>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {socialLinks.linkedinUrl && (
                    <a
                      href={socialLinks.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {socialLinks.githubUrl && (
                    <a
                      href={socialLinks.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {socialLinks.resumeUrl && (
                    <a
                      href={socialLinks.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience Section */}
            {metadata.experience && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{metadata.experience}</p>
                </CardContent>
              </Card>
            )}

            {/* Position of Responsibility */}
            {metadata.positionOfResponsibility && metadata.positionOfResponsibility.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    Position of Responsibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {metadata.positionOfResponsibility.map((position: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{position}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Project Showcase */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Project Showcase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Projects Curated */}
                {user.createdProjects.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">Projects Curated</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.createdProjects.map((project) => (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                          <h4 className="font-medium mb-2 text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-gray-300">{project.role}</Badge>
                            <Badge className={getDifficultyColor(project.difficulty)}>
                              {project.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(project.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Collaborated */}
                {user.joinRequests?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">Projects Collaborated</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.joinRequests
                        .filter(request => request.project)
                        .map(request => (
                          <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                            <h4 className="font-medium mb-2 text-gray-900">{request.project.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{request.project.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="border-gray-300">{request.project.role}</Badge>
                              <Badge className={getDifficultyColor(request.project.difficulty)}>
                                {request.project.difficulty}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDate(request.createdAt)}
                            </p>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                {user.createdProjects.length === 0 && user.joinRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No projects to showcase yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Skills */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Star className="w-5 h-5 text-blue-600" />
                  Top Skills
                </CardTitle>
                <CardDescription className="text-gray-600">Validated & evaluated by our mentors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { label: 'Strategic Thinker', value: skills.strategicThinker },
                    { label: 'Team Maker', value: skills.teamMaker },
                    { label: 'Decision Maker', value: skills.decisionMaker }
                  ].map((skill) => (
                    <div key={skill.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                        <span className="text-sm text-gray-500">{skill.value}%</span>
                      </div>
                      <Progress value={skill.value} className="h-2" />
                      {skill.label === 'Decision Maker' && <RatingDialog userId={user.id} />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hard Skills */}
            {metadata.hardSkills && metadata.hardSkills.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Hard Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {metadata.hardSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <a href={`mailto:${user.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                      {user.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Username:</span>
                    <span className="text-sm text-gray-600">@{metadata.username || user.username || 'skillup-user'}</span>
                  </div>
                  
                  {/* Quick Links */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex flex-col gap-2">
                      {socialLinks.linkedinUrl && (
                        <a
                          href={socialLinks.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn Profile
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {socialLinks.githubUrl && (
                        <a
                          href={socialLinks.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                        >
                          <Github className="w-4 h-4" />
                          GitHub Profile
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {socialLinks.resumeUrl && (
                        <a
                          href={socialLinks.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <FileText className="w-4 h-4" />
                          View Resume
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
