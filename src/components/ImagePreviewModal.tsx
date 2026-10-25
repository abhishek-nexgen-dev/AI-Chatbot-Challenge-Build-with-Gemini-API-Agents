import React from 'react';
import { X, Download } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageName: string | null;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = imageName || 'attachment-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 max-w-4xl max-h-[90vh] flex flex-col items-center">
        <div className="w-full flex items-center justify-between text-white pb-3 px-1">
          <span className="text-sm font-medium truncate max-w-xs sm:max-w-md">
            {imageName || 'Attached Image'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden shadow-2xl max-h-[80vh] flex items-center justify-center bg-black/40 border border-white/10">
          <img
            src={imageUrl}
            alt={imageName || 'Preview'}
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
