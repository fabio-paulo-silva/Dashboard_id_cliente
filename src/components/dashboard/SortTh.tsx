import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  sortKey: string;
  activeKey: string;
  dir: "asc" | "desc";
  onSort: (k: string) => void;
  className?: string;
}

export function SortTh({ label, sortKey, activeKey, dir, onSort, className }: Props) {
  const active = sortKey === activeKey;
  return (
    <th
      className={cn(
        "cursor-pointer select-none py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === "desc" ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronUp className="h-3 w-3 text-primary" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </span>
    </th>
  );
}
