import * as React from "react"

import { cn } from "@/lib/utils"

/** @type {React.ForwardRefRenderFunction<HTMLTableElement, React.ComponentPropsWithoutRef<'table'>>} */
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props} />
  </div>
))
Table.displayName = "Table"

/** @type {React.ForwardRefRenderFunction<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'thead'>>} */
const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

/** @type {React.ForwardRefRenderFunction<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'tbody'>>} */
const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} />
))
TableBody.displayName = "TableBody"

/** @type {React.ForwardRefRenderFunction<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'tfoot'>>} */
const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props} />
))
TableFooter.displayName = "TableFooter"

/** @type {React.ForwardRefRenderFunction<HTMLTableRowElement, React.ComponentPropsWithoutRef<'tr'>>} */
const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props} />
))
TableRow.displayName = "TableRow"

/** @type {React.ForwardRefRenderFunction<HTMLTableCellElement, React.ComponentPropsWithoutRef<'th'>>} */
const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableHead.displayName = "TableHead"

/** @type {React.ForwardRefRenderFunction<HTMLTableCellElement, React.ComponentPropsWithoutRef<'td'>>} */
const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableCell.displayName = "TableCell"

/** @type {React.ForwardRefRenderFunction<HTMLTableCaptionElement, React.ComponentPropsWithoutRef<'caption'>>} */
const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props} />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
