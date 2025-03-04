"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionDetailsDialog({ transaction, open, onOpenChange }) {
  if (!transaction) return null;

  const formattedDate = transaction.createdAt
    ? new Date(transaction.createdAt).toLocaleString()
    : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Details of transaction reference: {transaction.reference || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Type</div>
              <div className="mt-1">
                <Badge
                  className={`${
                    transaction.type === "IN"
                      ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400"
                  }`}
                >
                  {transaction.type}
                </Badge>
              </div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground">Reference</div>
              <div className="mt-1 font-medium">
                {transaction.reference || "N/A"}
              </div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground">Date</div>
              <div className="mt-1">{formattedDate}</div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground">
                Created By
              </div>
              <div className="mt-1">{transaction.createdBy || "Unknown"}</div>
            </div>
          </div>

          <div>
            <div className="font-medium text-muted-foreground">Notes</div>
            <div className="mt-1 rounded-md border bg-muted/50 p-3">
              {transaction.notes || "No notes provided"}
            </div>
          </div>

          <div>
            <div className="mb-2 font-medium">Items</div>
            <div className="rounded-md border">
              <ScrollArea className="h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">No</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      {transaction.type === "IN" && (
                        <TableHead>Location</TableHead>
                      )}
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.items && transaction.items.length > 0 ? (
                      transaction.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          {transaction.type === "IN" && (
                            <TableCell>
                              {item.location ? (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300"
                                >
                                  {item.location}
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          )}
                          <TableCell>{item.notes || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={transaction.type === "IN" ? 5 : 4}
                          className="h-24 text-center"
                        >
                          No items found in this transaction.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
