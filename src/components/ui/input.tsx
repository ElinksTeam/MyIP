import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn("h-11 w-full rounded-xl bg-muted/60 px-3 text-sm outline-none ring-1 ring-inset ring-white/10 transition focus:ring-2 focus:ring-primary/60 disabled:opacity-50", className)}
      {...props}
    />
  );
}

export { Input };
