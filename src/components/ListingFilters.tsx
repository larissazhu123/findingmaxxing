import { ListFilter, ArrowUpDown } from "lucide-react";

export type SortBy = "time" | "alpha";
export type SortOrder = "asc" | "desc";
export type TimeFilter = "all" | "1h" | "24h" | "7d";
export type CategoryFilter = number | "all";

const CATEGORY_OPTIONS = [
  { id: "all", label: "All categories" },
  { id: 1, label: "Keys" },
  { id: 2, label: "Cards/ID" },
  { id: 3, label: "Water Bottle" },
  { id: 4, label: "Jewelry" },
  { id: 5, label: "Headphones" },
  { id: 6, label: "Wallet" },
  { id: 7, label: "Tech" },
  { id: 99, label: "Other" },
] as const;

type ListingFiltersProps = {
  sortBy: SortBy;
  sortOrder: SortOrder;
  categoryFilter: CategoryFilter;
  timeFilter: TimeFilter;
  onChangeSortBy: (v: SortBy) => void;
  onChangeSortOrder: (v: SortOrder) => void;
  onChangeCategoryFilter: (v: CategoryFilter) => void;
  onChangeTimeFilter: (v: TimeFilter) => void;
};

export function ListingFilters({
  sortBy,
  sortOrder,
  categoryFilter,
  timeFilter,
  onChangeSortBy,
  onChangeSortOrder,
  onChangeCategoryFilter,
  onChangeTimeFilter,
}: ListingFiltersProps) {
  const selectCls =
    "appearance-none rounded-lg border border-green-300/70 bg-white/90 pl-3 pr-8 py-1.5 text-xs sm:text-sm text-green-900 shadow-sm transition hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 cursor-pointer bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2316a34a%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%200%201%201.06.02L10%2011.06l3.71-3.83a.75.75%200%201%201%201.08%201.04l-4.25%204.39a.75.75%200%200%201-1.08%200L5.21%208.27a.75.75%200%200%201%20.02-1.06Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]";

  const fieldLabelCls = "text-xs font-medium text-green-800/70 uppercase tracking-wide";

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-4 rounded-xl border border-green-200/60 bg-green-50/80 backdrop-blur-sm shadow-sm px-4 py-3 mb-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-green-700/95 text-white px-3 py-1.5 text-xs font-medium shadow-sm">
        <ListFilter className="h-3.5 w-3.5" />
        <span>Filter &amp; sort</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={fieldLabelCls}>Category</span>
          <select
            value={categoryFilter === "all" ? "all" : String(categoryFilter)}
            onChange={(e) =>
              onChangeCategoryFilter(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className={selectCls}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.id} value={String(opt.id)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className={fieldLabelCls}>Time</span>
          <select
            value={timeFilter}
            onChange={(e) => onChangeTimeFilter(e.target.value as TimeFilter)}
            className={selectCls}
          >
            <option value="all">All</option>
            <option value="1h">Last 1 hr</option>
            <option value="24h">Last 24 hrs</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className={fieldLabelCls}>Sort</span>
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as SortBy)}
            className={selectCls}
          >
            <option value="time">Time</option>
            <option value="alpha">Alphabetical</option>
          </select>
          <button
            type="button"
            aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            onClick={() =>
              onChangeSortOrder(sortOrder === "asc" ? "desc" : "asc")
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs sm:text-sm font-medium shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortOrder === "asc" ? "Asc" : "Desc"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
