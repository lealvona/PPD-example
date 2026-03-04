/**
 * AnalyticsDashboard — Shows detailed analytics for a story.
 *
 * Displays choice distribution, ending distribution, and path statistics.
 */

import { useMemo, type FC } from "react";
import { analyticsCollector } from "../utils/analyticsCollector";
import "./AnalyticsDashboard.css";

export interface AnalyticsDashboardProps {
  storyKey: string;
  storyTitle: string;
  onClose: () => void;
}

export const AnalyticsDashboard: FC<AnalyticsDashboardProps> = ({
  storyKey,
  storyTitle,
  onClose,
}) => {
  const analytics = useMemo(() => {
    return analyticsCollector.getAnalytics(storyKey);
  }, [storyKey]);

  const totalPlaythroughs = analytics.totalPlaythroughs;

  const choiceStats = useMemo(() => {
    const stats: { nodeId: string; choiceId: string; count: number; pct: number }[] = [];
    for (const [nodeId, choices] of Object.entries(analytics.choiceCounts)) {
      const nodeTotal = Object.values(choices).reduce((sum, c) => sum + c, 0);
      for (const [choiceId, count] of Object.entries(choices)) {
        stats.push({
          nodeId,
          choiceId,
          count,
          pct: nodeTotal > 0 ? Math.round((count / nodeTotal) * 100) : 0,
        });
      }
    }
    return stats.sort((a, b) => b.count - a.count);
  }, [analytics.choiceCounts]);

  const endingStats = useMemo(() => {
    const stats: { endingNodeId: string; count: number; pct: number }[] = [];
    const total = Object.values(analytics.endingCounts).reduce((sum, c) => sum + c, 0);
    for (const [endingNodeId, count] of Object.entries(analytics.endingCounts)) {
      stats.push({
        endingNodeId,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      });
    }
    return stats.sort((a, b) => b.count - a.count);
  }, [analytics.endingCounts]);

  const handleClear = () => {
    if (confirm("Clear all analytics data for this story?")) {
      analyticsCollector.clearAnalytics(storyKey);
      window.location.reload();
    }
  };

  const getBarWidth = (pct: number) => {
    return Math.max(pct, 5);
  };

  return (
    <div className="analytics-dashboard">
      <header className="analytics-dashboard__header">
        <h1>Analytics: {storyTitle}</h1>
        <button
          className="analytics-dashboard__close"
          onClick={onClose}
          aria-label="Close analytics"
        >
          ✕
        </button>
      </header>

      <div className="analytics-dashboard__content">
        <section className="analytics-dashboard__section">
          <h2>Overview</h2>
          <div className="analytics-dashboard__stats">
            <div className="analytics-dashboard__stat">
              <span className="analytics-dashboard__stat-value">
                {totalPlaythroughs}
              </span>
              <span className="analytics-dashboard__stat-label">
                Total Playthroughs
              </span>
            </div>
            <div className="analytics-dashboard__stat">
              <span className="analytics-dashboard__stat-value">
                {Object.keys(analytics.choiceCounts).length}
              </span>
              <span className="analytics-dashboard__stat-label">
                Nodes Explored
              </span>
            </div>
            <div className="analytics-dashboard__stat">
              <span className="analytics-dashboard__stat-value">
                {endingStats.length}
              </span>
              <span className="analytics-dashboard__stat-label">
                Endings Found
              </span>
            </div>
          </div>
        </section>

        {endingStats.length > 0 && (
          <section className="analytics-dashboard__section">
            <h2>Ending Distribution</h2>
            <div className="analytics-dashboard__chart">
              {endingStats.map((ending) => (
                <div key={ending.endingNodeId} className="analytics-dashboard__bar-row">
                  <span className="analytics-dashboard__bar-label">
                    {ending.endingNodeId}
                  </span>
                  <div className="analytics-dashboard__bar-container">
                    <div
                      className="analytics-dashboard__bar analytics-dashboard__bar--ending"
                      style={{ width: `${getBarWidth(ending.pct)}%` }}
                    >
                      <span className="analytics-dashboard__bar-value">
                        {ending.count} ({ending.pct}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {choiceStats.length > 0 && (
          <section className="analytics-dashboard__section">
            <h2>Choice Distribution</h2>
            <div className="analytics-dashboard__chart">
              {choiceStats.slice(0, 10).map((choice) => (
                <div key={`${choice.nodeId}-${choice.choiceId}`} className="analytics-dashboard__bar-row">
                  <span className="analytics-dashboard__bar-label">
                    {choice.nodeId}: {choice.choiceId}
                  </span>
                  <div className="analytics-dashboard__bar-container">
                    <div
                      className="analytics-dashboard__bar"
                      style={{ width: `${getBarWidth(choice.pct)}%` }}
                    >
                      <span className="analytics-dashboard__bar-value">
                        {choice.count} ({choice.pct}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalPlaythroughs === 0 && (
          <div className="analytics-dashboard__empty">
            <p>No analytics data yet.</p>
            <p>Play through the story to see statistics here.</p>
          </div>
        )}

        <footer className="analytics-dashboard__footer">
          <button
            className="analytics-dashboard__clear"
            onClick={handleClear}
            disabled={totalPlaythroughs === 0}
          >
            Clear Analytics
          </button>
        </footer>
      </div>
    </div>
  );
};
