import React from 'react';
import { cn } from '@/lib/utils';

export default function PublicCopyrightFooter({ className = '', maxWidthClass = 'max-w-[1380px]' }) {
  return (
    <footer
      aria-label="RallyHub copyright"
      className={cn('mx-auto w-full bg-[#053c56] text-white', maxWidthClass, className)}
    >
      <div className="flex min-h-[36px] items-center justify-center border-t border-white/10 px-4 py-2 text-center text-[10px] font-medium tracking-[.01em] text-white/70 sm:px-6 sm:text-[11px]">
        © 2026 RallyHub All rights reserved.
      </div>
    </footer>
  );
}
