interface Stat {
    label: string;
    value: string;
  }
  
  interface PageHeaderProps {
    title: string;
    description: string;
    stats?: Stat[];
  }
  
  export function PageHeader({ title, description, stats }: PageHeaderProps) {
    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-lg text-gray-600">{description}</p>
          
          {stats && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }