import React, { useState, useEffect, useRef } from 'react';
import { Slide, SliderConfig } from '../types';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ImageSliderProps {
  slides: Slide[];
  config: SliderConfig;
  defaultNote: string;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  slides,
  config,
  defaultNote,
}) => {
  const activeSlides = slides.length > 0 ? slides : [
    {
      id: 'default',
      imageUrl: '/images/uploads/cover-7c448a4e13ef72a09fe6.jpg',
      altText: 'Kadın sağlığı ve menopoz tanıtım semineri afişi',
      note: defaultNote,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(config.autoplay);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Sync autoplay state if config changes
  useEffect(() => {
    setIsPlaying(config.autoplay);
  }, [config.autoplay]);

  // Ensure currentIndex is in bounds
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Auto rotation
  useEffect(() => {
    if (!config.enabled || activeSlides.length <= 1 || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (config.pauseOnHover && isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, Math.max(1000, config.interval * 1000));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [config.enabled, config.interval, config.pauseOnHover, isPlaying, isHovered, activeSlides.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  const isMulti = config.enabled && activeSlides.length > 1;

  return (
    <div className="art">
      <div
        className="poster group select-none relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="region"
        aria-label="Seminer ve Bilgilendirme Görselleri"
      >
        {/* Main Image Container */}
        <div
          className="relative w-full overflow-hidden bg-purple-50"
          style={{ width: '100%', aspectRatio: '1 / 1', minHeight: '260px' }}
        >
          {activeSlides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            const isSlideEffect = config.effect === 'slide';

            return (
              <div
                key={slide.id || idx}
                style={{ width: '100%', height: '100%' }}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
                  isActive
                    ? 'opacity-100 z-10 scale-100 pointer-events-auto'
                    : isSlideEffect
                    ? idx < currentIndex
                      ? '-translate-x-full opacity-0 pointer-events-none'
                      : 'translate-x-full opacity-0 pointer-events-none'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.altText || 'Kadın sağlığı ve menopoz tanıtım semineri afişi'}
                  width={640}
                  height={640}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  className="w-full h-full object-cover block cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                  onClick={() => setLightboxOpen(true)}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/uploads/cover-7c448a4e13ef72a09fe6.jpg';
                  }}
                />
              </div>
            );
          })}

          {/* Quick Expand / Lightbox Button */}
          <button
            onClick={() => setLightboxOpen(true)}
            title="Görseli Büyüt"
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-purple-900 flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Tam Ekran Görüntüle"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Slider Controls (Shown if multiple slides & slider enabled) */}
          {isMulti && (
            <>
              {/* Previous Button */}
              {config.showArrows && (
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-purple-900 flex items-center justify-center shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  aria-label="Önceki Görsel"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              {/* Next Button */}
              {config.showArrows && (
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-purple-900 flex items-center justify-center shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  aria-label="Sonraki Görsel"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

            </>
          )}
        </div>
      </div>

      {/* Slide Note / Seminar Note */}
      <p className="poster-note whitespace-pre-line">
        {currentSlide.note || defaultNote}
      </p>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 px-4 border-b border-gray-100">
              <span className="text-xs font-bold text-purple-900 tracking-wide uppercase font-manrope">
                {currentSlide.title || 'Görsel İnceleme'} ({currentIndex + 1} / {activeSlides.length})
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.altText}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {isMulti && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                    aria-label="Önceki"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                    aria-label="Sonraki"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {currentSlide.note && (
              <div className="p-3 bg-purple-50 text-xs text-purple-950 text-center font-medium border-t border-purple-100 font-dmsans">
                {currentSlide.note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
