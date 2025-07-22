'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import joblists from '@/utils/joblists';
import rolelists from '@/utils/rolelists';

interface MembersSearchProps {
  onSearchAction: (filters: { job: string; role: string }) => void;
  onClearFiltersAction: () => void;
  loading?: boolean;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  label: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedOption: string) => {
    onValueChange(selectedOption);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onValueChange('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder={value || placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {value && (
              <button
                onClick={clearSelection}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                    value === option ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">
                No options found
              </div>
            )}
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default function MembersSearch({
  onSearchAction,
  onClearFiltersAction,
  loading = false,
}: MembersSearchProps) {
  const [job, setJob] = useState('');
  const [role, setRole] = useState('');
  const [hasFilters, setHasFilters] = useState(false);

  useEffect(() => {
    setHasFilters(job !== '' || role !== '');
  }, [job, role]);

  const handleSearch = () => {
    onSearchAction({ job, role });
  };

  const handleClearFilters = () => {
    setJob('');
    setRole('');
    onClearFiltersAction();
  };

  const handleJobChange = (value: string) => {
    setJob(value);
    onSearchAction({ job: value, role });
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    onSearchAction({ job, role: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Find Members</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Job Filter */}
          <SearchableSelect
            value={job}
            onValueChange={handleJobChange}
            options={joblists}
            placeholder="Search or select job title"
            label="Job Title"
          />

          {/* Role Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {rolelists.map((roleOption) => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {roleOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={handleSearch}
              disabled={loading || (!job && !role)}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            
            {hasFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-2">
                {job && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Job: {job}
                  </span>
                )}
                {role && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Role: {role}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}