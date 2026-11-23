import React from 'react';
import FilterTabBar from '@/components/common/FilterTabBar';
import SearchBar from '@/components/common/SearchBar';

const TABS = [
  { key: 'all',       label: 'All Orders' },
  { key: 'ACTIVE',    label: 'In Shop (Active)' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function MaintenanceFilters({
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
        placeholder="Filter by vehicle registration, type, description..."
        value={search}
        onChange={onSearchChange}
        className="w-full sm:w-80"
      />
    </div>
  );
}

