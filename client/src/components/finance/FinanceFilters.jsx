import React from 'react';
import FilterTabBar from '@/components/common/FilterTabBar';
import SearchBar from '@/components/common/SearchBar';

export default function FinanceFilters({
  tabs = [],
  activeTab = 'all',
  onTabChange,
  search = '',
  onSearchChange,
  getCount,
}) {
  return (
    <div className="space-y-3">
      {tabs.length > 0 && (
        <FilterTabBar
          tabs={tabs}
          active={activeTab}
          onChange={onTabChange}
          getCount={getCount}
        />
      )}
      <SearchBar
        placeholder="Search financial records by description or vehicle..."
        value={search}
        onChange={onSearchChange}
        className="w-full sm:w-80"
      />
    </div>
  );
}

