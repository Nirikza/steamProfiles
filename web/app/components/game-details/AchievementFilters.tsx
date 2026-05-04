import type { Filter, Sort } from "./types";

type AchievementFiltersProps = {
    search: string;
    filter: Filter;
    sort: Sort;
    onSearchChange: (value: string) => void;
    onFilterChange: (value: Filter) => void;
    onSortChange: (value: Sort) => void;
};

export default function AchievementFilters({
    search,
    filter,
    sort,
    onSearchChange,
    onFilterChange,
    onSortChange,
}: AchievementFiltersProps) {
    return (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
            <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search achievements..."
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />

            <select
                value={filter}
                onChange={(event) => onFilterChange(event.target.value as Filter)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            >
                <option value="all">All achievements</option>
                <option value="unlocked">Unlocked only</option>
                <option value="locked">Locked only</option>
                <option value="hidden">Hidden only</option>
                <option value="rare">Rare only (&lt;10%)</option>
                <option value="common">Common only (≥10%)</option>
            </select>

            <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value as Sort)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            >
                <option value="default">Default order</option>
                <option value="unlocked-first">Unlocked first</option>
                <option value="locked-first">Locked first</option>
                <option value="name">Name</option>
                <option value="rarity-asc">Rarest first</option>
                <option value="rarity-desc">Most common first</option>
            </select>
        </div>
    );
}