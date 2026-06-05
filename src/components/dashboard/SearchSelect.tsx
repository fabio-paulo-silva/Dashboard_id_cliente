import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchSelectProps {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onValueChange: (v: string) => void;
  className?: string;
}

export function SearchSelect({
  label,
  value,
  placeholder,
  options,
  onValueChange,
  className,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-9 w-full min-w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
              "hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring",
              !selected && "text-muted-foreground",
            )}
          >
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <div className="ml-2 flex shrink-0 items-center gap-1">
              {value !== "all" && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onValueChange("all"); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onValueChange("all"))}
                  className="rounded p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Nenhum resultado.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__all__"
                  onSelect={() => { onValueChange("all"); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === "all" ? "opacity-100" : "opacity-0")} />
                  {placeholder}
                </CommandItem>
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    onSelect={() => { onValueChange(o.value); setOpen(false); }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
