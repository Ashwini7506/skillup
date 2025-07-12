import { ProjectSelector } from "@/components/explore/project-selector";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import React from "react";
import { ScrollToProjectCard } from "@/components/explore/scroll-to-project-card";
import { ReceiptPoundSterlingIcon } from "lucide-react";
import Tracker from "@/components/Tracker";

interface PageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceHome({ params }: PageProps) {
  await userRequired();
  const { workspaceId } = await params;

  return (
    <div className="min-h-screen">
      <Tracker />
      {/* Hero Section */}
<div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 lg:py-32 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div> */}
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-purple-200 rounded-full animate-bounce opacity-60" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-indigo-200 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 right-10 w-3 h-3 bg-blue-300 rounded-full animate-bounce opacity-60" style={{animationDelay: '1.5s'}}></div>
        
        <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl mb-8 shadow-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Skill</span>
                <span className="text-gray-900">Up</span>
                <div className="text-2xl lg:text-3xl font-medium text-gray-600 mt-2">
                  ✨ Learn • Build • Succeed
                </div>
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed mb-8 font-light">
                Your personalized learning dashboard to bridge the gap between 
                <span className="font-semibold text-blue-600"> academic knowledge</span> and 
                <span className="font-semibold text-purple-600"> industry requirements</span>. 
                Track your progress, build real projects, and get placement-ready with curated experiences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex items-center text-gray-600 text-sm font-medium bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <span className="flex w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  <span>🎯 Personalized Learning Path</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm font-medium bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                  <span className="flex w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  <span>📊 Real-time Progress Tracking</span>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl p-20 shadow-xl border border-white/20">
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full"></div>
                      <div className="text-sm text-gray-600 mt-1">Frontend Development</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gradient-to-r from-purple-200 to-purple-400 rounded-full"></div>
                      <div className="text-sm text-gray-600 mt-1">Backend Development</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gradient-to-r from-indigo-200 to-indigo-400 rounded-full w-3/4"></div>
                      <div className="text-sm text-gray-600 mt-1">DevOps & Deployment</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center text-sm text-gray-600 font-medium">
                    <span className="mr-2">🚀</span>
                    <span>Ready for your next career move!</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Achievement Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg border border-gray-100 animate-bounce">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <div className="text-xs font-semibold text-gray-700">Achievement Unlocked!</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg border border-gray-100 animate-bounce" style={{animationDelay: '1s'}}>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📈</span>
                  <div className="text-xs font-semibold text-gray-700">Progress +25%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        {/* Action Cards Grid - Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Let's Get Started - Large Card */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-10 h-full relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8 group-hover:bg-white/30 transition-colors">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  🎯 Let's Get You Started!
                </h3>
                
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  Ready to level up? Tell us about your goals and expertise level to get personalized project recommendations that align with your career aspirations.
                </p>
                
                <ScrollToProjectCard />
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 gap-8">
            {/* Explore Blogs Card */}
            <a 
              href="/blogs"
              className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 block h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6 group-hover:bg-white/30 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  📚 Explore Our Blogs
                </h3>
                
                <p className="text-white/90 mb-6 leading-relaxed">
                  Dive into insightful articles, cutting-edge tutorials, and industry insights that keep you ahead of the curve.
                </p>
                
                <div className="flex items-center text-white font-semibold group-hover:text-yellow-300 transition-colors">
                  Read Blogs
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Explore Members Card */}
            <a 
              href="/members"
              className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 block h-full relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6 group-hover:bg-white/30 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  👥 Meet Fellow Learners
                </h3>
                
                <p className="text-white/90 mb-6 leading-relaxed">
                  Connect with like-minded peers, explore their amazing projects, and build your professional network.
                </p>
                
                <div className="flex items-center text-white font-semibold group-hover:text-yellow-300 transition-colors">
                  View Members
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Info Cards - Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -mr-16 -mt-16 opacity-60"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Why Start Early with SkillUp?
                </h3>
              </div>
              
              <p className="text-gray-600 leading-relaxed text-lg">
                Get ahead of the competition by building industry-relevant skills and projects that showcase your expertise to potential employers. 
                <span className="font-semibold text-emerald-600"> Early preparation = Better opportunities! 🎯</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -ml-16 -mb-16 opacity-60"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Ready to Level Up?
                </h3>
              </div>
              
              <p className="text-gray-600 leading-relaxed text-lg">
                Choose your learning path and start building projects that matter to your career. 
                <span className="font-semibold text-blue-600"> Your future self will thank you! 💪</span>
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector Section - Full Width */}
        <div id="project-selector" className="scroll-mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -ml-20 -mt-20 opacity-60"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -mr-16 -mb-16 opacity-60"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  🎯 Find Your Perfect Project
                </h2>
                <p className="text-gray-600 text-xl max-w-3xl mx-auto">
                  Discover projects tailored to your skill level and career goals. Let's build something amazing together!
                </p>
              </div>
              
              <ProjectSelector workspaceId={workspaceId} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold">SkillUp</h3>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md text-lg">
                🌟 Bridging the gap between academic knowledge and industry requirements through 
                personalized learning experiences and real-world projects.
              </p>
            </div>
            
            {/* <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/projects" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">📁</span> Projects
                </a></li>
                <li><a href="/blogs" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">📚</span> Blogs
                </a></li>
                <li><a href="/members" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">👥</span> Members
                </a></li>
              </ul>
            </div> */}
            
            <div>
              <h4 className="text-xl font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                <li><a href="/help-center" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">❓</span> Help Center
                </a></li>
                <li><a href="/subscription-policies" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2"><ReceiptPoundSterlingIcon/></span> Subscription Policies
                </a></li>
                <li><a href="/faq" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">💬</span> FAQ
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-lg"> 2025 SkillUp. All rights reserved. Made with ❤️ for learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

