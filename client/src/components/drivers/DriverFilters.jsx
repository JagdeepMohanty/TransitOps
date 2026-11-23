import React from 'react';
import FilterTabBar from '@/components/common/FilterTabBar';
import SearchBar from '@/components/common/SearchBar';

const TABS = [
  { key: 'all',       label: 'All Drivers' },
  { key: 'AVAILABLE', label: 'Available'   },
  { key: 'ON_TRIP',   label: 'On Trip'     },
  { key: 'OFF_DUTY',  label: 'Off Duty'    },
  { key: 'SUSPENDED', label: 'Suspended'   },
];

export default function DriverFilters({
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
        placeholder="Filter by driver name, license, contact..."
        value={search}
        onChange={onSearchChange}
        className="w-full sm:w-80"
      />
    </div>
  );
}

