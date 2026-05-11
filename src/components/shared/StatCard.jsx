import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, trend, trendUp, delay = 0, accentColor = 'primary' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-xl p-5 group hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-2 flex items-center gap-1",
              trendUp ? "text-primary" : "text-destructive"
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          accentColor === 'primary' && "bg-primary/10 text-primary",
          accentColor === 'accent' && "bg-accent/10 text-accent",
          accentColor === 'chart-3' && "bg-purple-500/10 text-purple-400",
          accentColor === 'chart-4' && "bg-yellow-500/10 text-yellow-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}