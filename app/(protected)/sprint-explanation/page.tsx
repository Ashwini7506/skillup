// app/sprint-explanation/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Zap, 
  Users, 
  Clock, 
  Target, 
  Trophy,
  Rocket,
  Star,
  Play
} from 'lucide-react'

const SprintExplanationPage = () => {
  const router = useRouter()

  const handleBackToHome = () => {
    router.push('/workspace')
  }

  const sprintQuotes = [
    {
      quote: "Sprint isn't just about speed, it's about momentum.",
      author: "Team Innovation"
    },
    {
      quote: "Great ideas emerge when diverse minds collaborate under pressure.",
      author: "Sprint Veterans"
    },
    {
      quote: "In sprints, we don't just build products - we build legends.",
      author: "Code Warriors"
    },
    {
      quote: "Every sprint is a chance to turn your wildest ideas into reality.",
      author: "Dream Builders"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b-2 border-yellow-400">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 hover:bg-yellow-50 text-gray-700"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Hero Section with Catchy Hook */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-black text-yellow-400 px-6 py-3 rounded-full text-lg font-bold mb-8">
              <Zap className="w-6 h-6" />
              SPRINT MODE ACTIVATED
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
              READY TO 
              <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                SPRINT?
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-bold text-black/80 mb-8 leading-relaxed">
              Transform your ideas into reality in just <span className="text-blue-600">4 weeks</span> of 
              intense collaboration, innovation, and pure coding magic! ⚡
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-blue-600 text-white px-6 py-3 text-lg font-semibold hover:bg-blue-700">
                <Users className="w-5 h-5 mr-2" />
                Team Collaboration
              </Badge>
              <Badge className="bg-black text-yellow-400 px-6 py-3 text-lg font-semibold hover:bg-gray-800">
                <Clock className="w-5 h-5 mr-2" />
                4 weeks of Focus
              </Badge>
              <Badge className="bg-blue-600 text-white px-6 py-3 text-lg font-semibold hover:bg-blue-700">
                <Trophy className="w-5 h-5 mr-2" />
                Epic Results
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white border-b-4 border-yellow-400">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
              What is a <span className="text-yellow-500">Sprint</span>?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-black" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Intense Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    4 weeks of pure, uninterrupted focus on building something extraordinary. 
                    No distractions, just pure creation energy.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Team Power</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Join forces with like-minded innovators. Different skills, one vision, 
                    unlimited potential for greatness.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-yellow-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Real Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Build functional, impressive projects that showcase your skills 
                    and solve real problems. Portfolio gold! ✨
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Video Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-black py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              See Sprint <span className="text-yellow-400">Magic</span> in Action
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Watch how teams transform from strangers to legends in just 4 weeks
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-4 border-yellow-400 shadow-2xl">
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-black mb-2">SKILLUP SPRINT 2024</h3>
                      <p className="text-black/70 font-medium">
                        🔥 Epic 48-hour journey from idea to impact
                      </p>
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3"
                      onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Full Story
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Inspirational Quotes Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Sprint <span className="text-blue-600">Legends</span> Speak
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from the warriors who've conquered the 48-hour challenge
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {sprintQuotes.map((item, index) => (
              <Card key={index} className="bg-white border-2 border-gray-100 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-6 h-6 text-black" />
                    </div>
                    <blockquote className="text-lg font-semibold text-gray-800 mb-4 italic">
                      "{item.quote}"
                    </blockquote>
                    <p className="text-blue-600 font-bold text-sm">
                      - {item.author}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Ready to Begin Your <span className="text-yellow-400">Journey</span>?
            </h2>
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
              Every sprint master started exactly where you are now. 
              The only difference? They took the leap.
            </p>
            
            <div className="space-y-6">
              <Button 
                onClick={handleBackToHome}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black text-xl px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Rocket className="w-6 h-6 mr-3" />
                START YOUR SPRINT JOURNEY
              </Button>
              
              <p className="text-gray-400 text-lg">
                Take me back to homepage and let me start building! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SprintExplanationPage
