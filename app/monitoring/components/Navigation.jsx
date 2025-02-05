export default function Navigation() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="mx-auto px-6 py-2 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Left side - Brand and Navigation */}
          <div className="flex">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-orange-500 tracking-wide">
                FASAU
              </span>
            </div>
            {/* Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex">
              <div className="flex space-x-8 h-12 items-center">
                <a
                  href="/"
                  className="text-gray-400 hover:text-white inline-flex items-center h-full px-3 text-base font-medium border-b-2 border-transparent hover:border-gray-600"
                >
                  Dashboard
                </a>
                <a
                  href="/monitoring"
                  className="text-white inline-flex items-center h-full px-3 text-base font-medium border-b-2 border-orange-500"
                  aria-current="page"
                >
                  Monitoring
                </a>
                <a
                  href="/tasks"
                  className="text-gray-400 hover:text-white inline-flex items-center h-full px-3 text-base font-medium border-b-2 border-transparent hover:border-gray-600"
                >
                  Tasks
                </a>
                <a
                  href="/reports"
                  className="text-gray-400 hover:text-white inline-flex items-center h-full px-3 text-base font-medium border-b-2 border-transparent hover:border-gray-600"
                >
                  Reports
                </a>
              </div>
            </div>
          </div>
          {/* Right side - Profile section */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-orange-600 flex items-center justify-center">
                <span className="text-white font-semibold text-base">JD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
