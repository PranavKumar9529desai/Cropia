import { useWatch, Control } from "react-hook-form";
import { Smartphone, Image as ImageIcon } from "lucide-react";

interface PhonePreviewProps {
  control: Control<any>;
}

export function PhonePreview({ control }: PhonePreviewProps) {
  const values = useWatch({ control });
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-[8px] border-gray-800 relative ring-1 ring-gray-950/50 select-none overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-7 bg-gray-800 rounded-b-xl z-20"></div>

      {/* Screen Content */}
      <div
        className="w-full h-full bg-cover bg-center rounded-[2.2rem] overflow-hidden relative"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1516655855035-d5215bcb5604?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")',
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        {/* Status Bar */}
        <div className="flex justify-between items-center px-5 pt-3 text-white text-[10px] font-medium z-10 relative">
          <span>{currentTime}</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
            <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
            <div className="w-3 h-3 border border-white rounded-[2px] opacity-80"></div>
          </div>
        </div>

        {/* Lock Screen Date */}
        <div className="text-center mt-12 text-white drop-shadow-md z-10 relative">
          <div className="text-5xl font-light tracking-tighter">
            {currentTime}
          </div>
          <div className="text-sm font-medium opacity-90 mt-1">
            Wednesday, October 25
          </div>
        </div>

        {/* Notification Bubble */}
        <div className="mt-8 px-3 z-10 relative">
          {!values.title && !values.body ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg opacity-50 border border-white/20">
              <div className="h-2 w-1/3 bg-gray-300 rounded mb-2"></div>
              <div className="h-2 w-2/3 bg-gray-300 rounded"></div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/40 transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-emerald-600 rounded-md flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">C</span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">
                    Cropia
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">now</span>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1 truncate">
                    {values.title || "Notification Title"}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {values.body ||
                      "Notification message details will appear here..."}
                  </p>
                </div>
                {values.imageUrl && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                    <img
                      src={values.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/100?text=Error";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-2 left-0 w-full px-8 pb-4 flex justify-between items-center text-white/60 z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
