'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import joblists from '@/utils/joblists';
import rolelists from '@/utils/rolelists';
// import { joblists} from '@/lib/joblists';

interface MembersSearchProps {
  onSearchAction: (filters: { job: string; role: string }) => void;
  onClearFiltersAction: () => void;
  loading?: boolean;
}

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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Job Title</label>
            <Select value={job} onValueChange={handleJobChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                {joblists.map((job: string) => (
                  <SelectItem key={job} value={job}>
                    {job}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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