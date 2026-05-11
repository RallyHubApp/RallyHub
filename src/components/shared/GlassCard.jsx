import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, glow, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "glass rounded-xl p-5",
        glow === 'green' && 'glow-green',
        glow === 'blue' && 'glow-blue',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}