"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageItem {
  id?: string;
  url: string;
  sortOrder: number;
}

interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (files.length > remaining) {
      toast.error(`You can only add ${remaining} more image(s)`);
    }

    setUploading(true);
    const uploads: ImageItem[] = [];

    for (const file of files.slice(0, remaining)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          uploads.push({ url: data.url, sortOrder: images.length + uploads.length });
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    onChange([...images, ...uploads]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  return (
    <div className="space-y-3">
      <Label>Images</Label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded bg-white/80 p-1 text-slate-700 hover:bg-white disabled:opacity-30">&larr;</button>
              <button type="button" onClick={() => remove(i)} className="rounded bg-red-500/80 p-1 text-white hover:bg-red-500">
                <X className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="rounded bg-white/80 p-1 text-slate-700 hover:bg-white disabled:opacity-30">&rarr;</button>
            </div>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-primary hover:text-primary",
              uploading && "pointer-events-none opacity-50",
            )}
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />
      <p className="text-xs text-slate-400">{images.length}/{maxImages} images. Click to add.</p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}
