import React from 'react';
import FilterTabBar from '@/components/common/FilterTabBar';
import SearchBar from '@/components/common/SearchBar';

const TABS = [
  { key: 'all',        label: 'All Trips'   },
  { key: 'DRAFT',      label: 'Draft / Plan'},
  { key: 'DISPATCHED', label: 'In Transit'  },
  { key: 'COMPLETED',  label: 'Completed'   },
  { key: 'CANCELLED',  label: 'Cancelled'   },
];

export default function TripFilters({
  activeTab = 'all',
  onTabChange,
  search = '',
  onSearchChange,
  total,
}) {
  return (
    <div className="space-y-3">
      <FilterTabBar
        tabs={TABS}
        active={activeTab}
        onChange={onTabChange}
        getCount={(key) => (key === 'all' ? total : undefined)}
      />
      <SearchBar
        placeholder="Filter by origin, destination, or vehicle..."
        value={search}
        onChange={onSearchChange}
        className="w-full sm:w-80"
      />
    </div>
  );
}

