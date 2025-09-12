"use client";

import { useEffect, useState } from "react";
import Rating from "./Rating";

interface SiteStatsProps {
  diveSiteSlug: string;
}

const SiteStats = ({ diveSiteSlug }: SiteStatsProps) => {
  const [stats, setStats] = useState<{
    avg_rating: number;
    review_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const res = await fetch(`/app/api/dives/${diveSiteSlug}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
      setLoading(false);
    };

    fetchStats();
  }, [diveSiteSlug]);

  if (loading) {
    return <div>Loading stats...</div>;
  }

  if (!stats || stats.review_count === 0) {
    return <div className="text-sm text-gray-600">No reviews yet</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <Rating rating={Math.round(stats.avg_rating)} />
      <span className="text-sm text-gray-600">
        {stats.avg_rating.toFixed(1)} ({stats.review_count} reviews)
      </span>
    </div>
  );
};

export default SiteStats;
