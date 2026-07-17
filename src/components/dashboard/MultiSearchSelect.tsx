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

interface MultiSearchSelectProps {
  label: string;
  values: string[];
  placeholder: string;
  options: { value: string; label: string }[];
  onValuesChange: (v: string[]) => void;
  className?: string;
}

export function MultiSearchSelect({
  label,
  values,
  placeholder,
  options,
  onValuesChange,
  className,
}: MultiSearchSelectProps) {
  const [open, setOpen] = useState(false);

  function toggle(v: string) {
    if (values.includes(v)) {
      onValuesChange(values.filter((x) => x !== v));
    } else {
      onValuesChange([...values, v]);
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onValuesChange([]);
  }

  const triggerLabel = (() => {
    if (values.length === 0) return null;
    if (values.length === 1) {
      return options.find((o) => o.value === values[0])?.label ?? values[0];
    }
    return `${values.length} selecionados`;
  })();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-9 w-full min-w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
              "hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring",
              values.length === 0 && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {triggerLabel ?? placeholder}
            </span>
            <div className="ml-2 flex shrink-0 items-center gap-1">
              {values.length > 0 && (
                <>
                  {values.length > 1 && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary leading-none">
                      {values.length}
                    </span>
                  )}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={clear}
                    onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onValuesChange([]))}
                    className="rounded p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Nenhum resultado.</CommandEmpty>
              <CommandGroup>
                {options.map((o) => {
                  const checked = values.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.label}
                      onSelect={() => toggle(o.value)}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input transition-colors",
                        checked && "border-primary bg-primary text-primary-foreground",
                      )}>
                        {checked && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{o.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>

          {/* Footer com ações */}
          {values.length > 0 && (
            <div className="border-t px-3 py-2">
              <button
                onClick={() => onValuesChange([])}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Limpar seleção ({values.length})
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
