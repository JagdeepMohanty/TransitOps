import React from 'react';
import FilterTabBar from '@/components/common/FilterTabBar';
import SearchBar from '@/components/common/SearchBar';

const TABS = [
  { key: 'all',       label: 'All Vehicles' },
  { key: 'AVAILABLE', label: 'Available'    },
  { key: 'ON_TRIP',   label: 'On Trip'      },
  { key: 'IN_SHOP',   label: 'In Shop'      },
  { key: 'RETIRED',   label: 'Retired'      },
];

export default function VehicleFilters({
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
        placeholder="Filter by registration, model, region..."
        value={search}
        onChange={onSearchChange}
        className="w-full sm:w-80"
      />
    </div>
  );
}

