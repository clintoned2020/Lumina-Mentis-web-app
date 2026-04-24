import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * MobileSelect — drops down on desktop, opens a bottom sheet Drawer on mobile.
 *
 * Props:
 *   value        — controlled value
 *   onValueChange — change handler
 *   placeholder  — trigger placeholder text
 *   label        — drawer title (shown in bottom sheet header)
 *   options      — array of { value: string, label: string }
 *   className    — extra classes for the trigger
 *   disabled     — disables the control
 */
export function MobileSelect({
  value,
  onValueChange,
  placeholder = "Select...",
  label = "Select an option",
  options = [],
  className,
  disabled,
}) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  if (isMobile) {
    return (
      <>
        {/* Trigger button — matches SelectTrigger styling */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !selectedLabel && "text-muted-foreground",
            className
          )}
        >
          <span className="line-clamp-1">{selectedLabel || placeholder}</span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </button>

        {/* Bottom sheet */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[80vh] overflow-hidden">
            <DrawerHeader>
              <DrawerTitle>{label}</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-8 overscroll-contain">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onValueChange?.(option.value);
                      setDrawerOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop — standard Radix Select
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}