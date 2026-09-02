'use client';

import { useEffect } from 'react';

import Image from 'next/image';

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

import type { GalleryPhoto } from './types';

interface Props {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function GalleryLightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = photos[index];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onNavigate((index + 1) % photos.length);
      if (event.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, photos.length, onNavigate]);

  if (!photo) return null;

  return (
    <Transition appear show as="div">
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <TransitionChild
          as="div"
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
        </TransitionChild>

        <TransitionChild
          as="div"
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="fixed inset-0 flex flex-col items-center justify-center p-4 sm:p-10"
        >
          <DialogPanel className="flex max-h-full max-w-full flex-col items-center">
            <div className="relative flex max-h-[80vh] max-w-[90vw] items-center justify-center">
              <Image
                src={photo.src}
                alt={photo.caption ?? photo.tag}
                width={photo.width}
                height={photo.height}
                className="max-h-[80vh] max-w-[90vw] rounded object-contain"
                sizes="90vw"
                priority
              />
            </div>
            <div className="mt-4 text-center text-white">
              {photo.caption && <p className="text-sm font-medium sm:text-base">{photo.caption}</p>}
              <p className="mt-1 text-xs text-white/60">{photo.tag}</p>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  className="fixed top-1/2 left-2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:left-6"
                  onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
                >
                  <ChevronIcon className="h-8 w-8 rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  className="fixed top-1/2 right-2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:right-6"
                  onClick={() => onNavigate((index + 1) % photos.length)}
                >
                  <ChevronIcon className="h-8 w-8" />
                </button>
              </>
            )}

            <button
              type="button"
              aria-label="Close"
              className="fixed top-2 right-2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:top-6 sm:right-6"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L11.586 9 7.293 4.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
