interface EmptyStateProps {
  onClearFilters: () => void
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-4 animate-fade-in">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-h3 text-brand-black mb-2">No records found</h3>
      <p className="text-body text-brand-muted mb-6 max-w-sm mx-auto">
        No records found for these filters. Try removing a filter to see more results.
      </p>
      <button
        onClick={onClearFilters}
        id="clear-all-filters-btn"
        className="btn-secondary"
      >
        Clear all filters
      </button>
    </div>
  )
}
