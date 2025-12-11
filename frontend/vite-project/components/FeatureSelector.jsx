import {FileVideo , Image , Music, Scissors, Minimize2} from 'lucide-react';

function FeatureSelector({onSelectFeature}){
    const features = [
        {
            id:'convert',
            title:'Format Convertor',
            description:'Convert video between different formats (MP4, WebM, et.)',
            icon: <FileVideo className='w-8 h-8' />,
            gradient: 'from-purple-500 to-pink-600',
        },
        {
            id: 'thumbnails',
            title: 'Extract Thumbnails',
            description: 'Generate thumbnail images at specific intervals from your video',
            icon: <Image className="w-8 h-8" />,
            gradient: 'from-cyan-500 to-blue-600',
        },
          {
            id: 'audio',
            title: 'Extract Audio',
            description: 'Extract audio track from video and save as MP3 or other formats',
            icon: <Music className="w-8 h-8" />,
            gradient: 'from-green-500 to-emerald-600',
        },
        {
            id: 'trim',
            title: 'Trim Video',
            description: 'Cut and trim your video to specific start and end times',
            icon: <Scissors className="w-8 h-8" />,
            gradient: 'from-orange-500 to-red-600',
        },
        {
            id: 'compress',
            title: 'Compress Video',
            description: 'Reduce video file size while maintaining quality',
            icon: <Minimize2 className="w-8 h-8" />,
            gradient: 'from-indigo-500 to-purple-600',
        },
    ]

   
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold text-center">Choose a Feature</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onSelectFeature(feature.id)}
            className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:border-gray-600 hover:scale-[1.02] hover:shadow-xl text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                 style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />

            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-5`}>
              {feature.icon}
            </div>

            <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-300 text-base leading-relaxed">
              {feature.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-cyan-400 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Get Started</span>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>
      </div>
      );
 
}

export default FeatureSelector;