import React from 'react'
import { motion } from 'framer-motion'

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-frame shimmer" />
      <div className="skeleton-line shimmer" />
      <style>{`
        .skeleton-frame { aspect-ratio: 2/3; border-radius: var(--radius-md); background: var(--bg-panel-raised); }
        .skeleton-line { height: 12px; width: 70%; margin-top: 10px; border-radius: 4px; background: var(--bg-panel-raised); }
        .shimmer {
          position: relative; overflow: hidden;
        }
        .shimmer::after {
          content: ''; position: absolute; inset: 0; transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}

export function SkeletonRow({ count = 6 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
