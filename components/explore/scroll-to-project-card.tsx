"use client";

export function ScrollToProjectCard() {
  const scrollToProjectSelector = () => {
    const element = document.getElementById('project-selector');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      onClick={scrollToProjectSelector}
      className="group bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-emerald-100"
    >
      <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6 group-hover:bg-emerald-200 transition-colors">
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Let's Get You Started
      </h3>
      <p className="text-gray-600 mb-4">
        Tell us about your goals and expertise level to get personalized project recommendations.
      </p>
      <div className="flex items-center text-emerald-600 font-medium group-hover:text-emerald-700">
        Get Started
        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}