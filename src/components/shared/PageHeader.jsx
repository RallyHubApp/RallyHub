import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6 min-w-0"
    >
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight break-words">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children && <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{children}</div>}
    </motion.div>
  );
}