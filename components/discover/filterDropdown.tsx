"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, GitBranch, Users } from "lucide-react";
// import { FilterType } from "@/types/discover";
import { cn } from "@/lib/utils";
import { FilterType } from "@/utils/types";

interface FilterDropdownProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  className?: string;
}

export function FilterDropdown({
  currentFilter,
  onFilterChange,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    {
      value: "team" as FilterType,
      label: "Team",
      icon: GitBranch,
      description: "Curated projects from skillup team",
    },
    {
      value: "community" as FilterType,
      label: "Community",
      icon: Users,
      description: "Projects from the community",
    },
  ];

  const currentFilterData = filters.find((f) => f.value === currentFilter);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between min-w-[140px]", className)}
        >
          <div className="flex items-center gap-2">
            {currentFilterData?.icon && (
              <currentFilterData.icon className="h-4 w-4" />
            )}
            <span>{currentFilterData?.label}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.value}
            onClick={() => {
              onFilterChange(filter.value);
              setIsOpen(false);
            }}
            className={cn(
              "flex items-start gap-2 p-3 cursor-pointer",
              currentFilter === filter.value && "bg-accent"
            )}
          >
            <filter.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">{filter.label}</div>
              <div className="text-xs text-muted-foreground">
                {filter.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}