// components/sprint/TeamPortfolioPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin,
  ExternalLink,
  Download,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Star,
  Calendar,
  Trophy,
  Target,
  Lightbulb
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

interface TeamFile {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface TeamVideo {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
}

interface TeamData {
  id: string;
  name: string;
  cohortName: string;
  workspaceId: string;
  members: TeamMember[];
  videos: TeamVideo[];
  files: TeamFile[];
  projectId?: string | null;
  projectName?: string | null;
}

interface TeamPortfolioPageProps {
  team: TeamData;
  workspaceId: string;
}

export function TeamPortfolioPage({ team, workspaceId }: TeamPortfolioPageProps) {
  const router = useRouter();

  const extractVideoId = (url: string) => {
    // For YouTube URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) return youtubeMatch[1];
    
    // For Vimeo URLs
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return vimeoMatch[1];
    
    // Return empty string if no match
    return '';
  };

  const getAutoplayUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractVideoId(url);
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    } else if (url.includes('vimeo.com')) {
      const videoId = extractVideoId(url);
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`;
    }
    return url;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return <ImageIcon className="w-5 h-5 text-green-500" />;
      case 'VIDEO': return <Video className="w-5 h-5 text-red-500" />;
      case 'PDF':
      case 'DOCUMENT': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // Mock skills calculation - you can replace this with actual logic
  const teamSkills = {
    strategicThinker: 75,
    teamMaker: 85,
    decisionMaker: 70
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={'/'}>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sprint
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-start gap-8 w-full">
              {/* Team Avatar/Logo */}
              <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-64 h-64 border-8 border-white shadow-2xl ring-4 ring-blue-500/20 transition-all duration-300 group-hover:scale-105 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Team Info */}
              <div className="flex-1 text-center md:text-left min-h-[256px] flex flex-col justify-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                  {team.name}
                </h1>
                <p className="text-2xl text-gray-600 mb-6 font-medium">{team.cohortName}</p>
                
                {team.projectName && (
                  <div className="mb-6">
                    <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg font-medium">
                      Project: {team.projectName}
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium">
                    <Users className="w-4 h-4 mr-1" />
                    {team.members.length} Members
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium">
                    <Video className="w-4 h-4 mr-1" />
                    {team.videos.length} Videos
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium">
                    <FileText className="w-4 h-4 mr-1" />
                    {team.files.length} Files
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Videos Section (Auto-playing) */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Play className="w-5 h-5 text-red-500" />
                  Team Videos
                </CardTitle>
                <CardDescription className="text-gray-600">Project demonstrations and presentations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {team.videos.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No videos uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Featured Video (First video, auto-playing) */}
                    {team.videos[0] && (
                      <div className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                          <iframe
                            src={getAutoplayUrl(team.videos[0].url)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{team.videos[0].title}</h3>
                            <p className="text-gray-600 text-sm">
                              {new Date(team.videos[0].uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => window.open(team.videos[0].url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Additional Videos Grid (Auto-playing) */}
                    {team.videos.length > 1 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">More Videos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {team.videos.slice(1).map((video) => (
                            <Card key={video.id} className="hover:shadow-lg transition-shadow">
                              <CardContent className="p-0">
                                <div className="aspect-video bg-black rounded-t-lg relative overflow-hidden">
                                  <iframe
                                    src={getAutoplayUrl(video.url)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="p-4">
                                  <h4 className="font-medium text-gray-900 mb-1 truncate">{video.title}</h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(video.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Files Section */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Uploaded Files
                </CardTitle>
                <CardDescription className="text-gray-600">Documents, presentations, and resources</CardDescription>
              </CardHeader>
              <CardContent>
                {team.files.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {team.files.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {getFileIcon(file.type)}
                              <div>
                                <h3 className="font-medium text-gray-900">{file.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(file.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = file.url;
                                  a.download = file.name;
                                  a.click();
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Team Skills */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Star className="w-5 h-5 text-blue-600" />
                  Team Skills
                </CardTitle>
                <CardDescription className="text-gray-600">Collective team capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { label: 'Strategic Thinker', value: teamSkills.strategicThinker },
                    { label: 'Team Maker', value: teamSkills.teamMaker },
                    { label: 'Decision Maker', value: teamSkills.decisionMaker }
                  ].map((skill) => (
                    <div key={skill.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                        <span className="text-sm text-gray-500">{skill.value}%</span>
                      </div>
                      <Progress value={skill.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="w-5 h-5 text-blue-600" />
                  Team Members
                </CardTitle>
                <CardDescription className="text-gray-600">{team.members.length} active members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="w-12 h-12 ring-2 ring-blue-500/20">
                      <AvatarImage 
                        src={member.image && member.image !== "null" ? member.image : undefined} 
                        alt={member.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-sm text-gray-600 truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Contact Information
                </CardTitle>
                <CardDescription className="text-gray-600">Get in touch with team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {team.members.map((member) => (
                  <div key={member.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage 
                          src={member.image && member.image !== "null" ? member.image : undefined} 
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                            <a href={`mailto:${member.email}`} className="hover:text-blue-600 truncate">
                              {member.email}
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1 mt-2">
                          {member.githubUrl && member.githubUrl !== "null" && (
                            <a href={member.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-7 px-2">
                                <Github className="w-3 h-3" />
                              </Button>
                            </a>
                          )}
                          {member.linkedinUrl && member.linkedinUrl !== "null" && (
                            <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-7 px-2">
                                <Linkedin className="w-3 h-3" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}