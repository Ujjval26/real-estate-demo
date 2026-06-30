"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PropertyGalleryProps {
  images: { url: string }[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-400">
        No photos available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        { }
        <img
          src={images[active].url}
          alt={`Photo ${active + 1}`}
          className="h-full w-full cursor-zoom-in object-cover"
          onClick={() => setLightbox(true)}
        />
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow"
              onClick={(e) => {
                e.stopPropagation();
                setActive((i) => (i - 1 + images.length) % images.length);
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow"
              onClick={(e) => {
                e.stopPropagation();
                setActive((i) => (i + 1) % images.length);
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 rounded-full bg-white/90"
          onClick={() => setLightbox(true)}
        >
          <Expand className="mr-1 h-3.5 w-3.5" /> {active + 1} / {images.length}
        </Button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 ${
                i === active ? "border-primary" : "border-transparent hover:border-slate-300"
              }`}
            >
              { }
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-5xl border-none bg-black/95 p-0">
          <DialogTitle className="sr-only">Photo gallery</DialogTitle>
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex h-[80vh] items-center justify-center">
            { }
            <img
              src={images[active].url}
              alt={`Photo ${active + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => setActive((i) => (i + 1) % images.length)}
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
