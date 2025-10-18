"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  User,
  FileText,
  Briefcase,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  useCommandPaletteSearch,
  type SearchResult,
} from "@/hooks/use-command-palette-search";
import {
  getQuickActions,
  filterActionsByPermission,
  searchActions,
} from "@/components/command-palette-actions";
import { useAbility } from "@/providers/ability-context";

const RESULT_TYPE_ICONS = {
  employee: User,
  document: FileText,
  job: Briefcase,
  leave: Calendar,
  payroll: DollarSign,
} as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const ability = useAbility();

  const { results, isLoading, isEmpty } = useCommandPaletteSearch(query);

  // Get filtered actions based on permissions
  const allActions = getQuickActions(ability);
  const permittedActions = filterActionsByPermission(allActions, ability);
  const filteredActions = searchActions(permittedActions, query);

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  // Group results by type
  const employeeResults = results.filter((r) => r.type === "employee");
  const documentResults = results.filter((r) => r.type === "document");
  const jobResults = results.filter((r) => r.type === "job");
  const leaveResults = results.filter((r) => r.type === "leave");

  // Group actions by category
  const navigationActions = filteredActions.filter(
    (a) => a.category === "navigation",
  );
  const createActions = filteredActions.filter((a) => a.category === "create");
  const quickActionItems = filteredActions.filter(
    (a) => a.category === "quick-action",
  );

  const hasSearchResults =
    employeeResults.length > 0 ||
    documentResults.length > 0 ||
    jobResults.length > 0 ||
    leaveResults.length > 0;

  const showActions = query.length === 0 || !hasSearchResults;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search employees, documents, jobs... or type a command"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        )}

        {!isLoading && isEmpty && query.length > 0 && (
          <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
        )}

        {!isLoading && (
          <>
            {/* Search Results */}
            {employeeResults.length > 0 && (
              <>
                <CommandGroup heading="Employees">
                  {employeeResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() =>
                        handleSelect(() => navigateTo(result.href))
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle && (
                          <span className="text-muted-foreground text-xs">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {documentResults.length > 0 && (
              <>
                <CommandGroup heading="Documents">
                  {documentResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() =>
                        handleSelect(() => navigateTo(result.href))
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle && (
                          <span className="text-muted-foreground text-xs">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {jobResults.length > 0 && (
              <>
                <CommandGroup heading="Job Postings">
                  {jobResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() =>
                        handleSelect(() => navigateTo(result.href))
                      }
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle && (
                          <span className="text-muted-foreground text-xs">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {leaveResults.length > 0 && (
              <>
                <CommandGroup heading="Leave Requests">
                  {leaveResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() =>
                        handleSelect(() => navigateTo(result.href))
                      }
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle && (
                          <span className="text-muted-foreground text-xs">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Quick Actions */}
            {showActions && (
              <>
                {navigationActions.length > 0 && (
                  <>
                    <CommandGroup heading="Navigation">
                      {navigationActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <CommandItem
                            key={action.id}
                            value={action.label}
                            onSelect={() =>
                              handleSelect(() => {
                                if (action.href) navigateTo(action.href);
                                if (action.action) action.action();
                              })
                            }
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{action.label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {createActions.length > 0 && (
                  <>
                    <CommandGroup heading="Create">
                      {createActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <CommandItem
                            key={action.id}
                            value={action.label}
                            onSelect={() =>
                              handleSelect(() => {
                                if (action.href) navigateTo(action.href);
                                if (action.action) action.action();
                              })
                            }
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{action.label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {quickActionItems.length > 0 && (
                  <CommandGroup heading="Quick Actions">
                    {quickActionItems.map((action) => {
                      const Icon = action.icon;
                      return (
                        <CommandItem
                          key={action.id}
                          value={action.label}
                          onSelect={() =>
                            handleSelect(() => {
                              if (action.href) navigateTo(action.href);
                              if (action.action) action.action();
                            })
                          }
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{action.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
