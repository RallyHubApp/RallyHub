import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfileAvatarUpload({ currentUrl, initials, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPreview(file_url);
    await onUploaded?.(file_url);
    setUploading(false);
  };

  return (
    <div className="relative group shrink-0">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
        {(preview || currentUrl) ? (
          <img src={preview || currentUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-primary">{initials}</span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Camera className="w-3.5 h-3.5" />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
    </div>
  );
}