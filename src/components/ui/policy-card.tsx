"use client";

import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import { CalendarDays, Car, FileText, MoreVertical } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "@/lib/utils";

interface PolicyCardProps {
  policy: {
    _id: string;
    policyNumber: string;
    vehicleInfo: {
      make: string;
      model: string;
      yearOfManufacture: number;
    };
    startDate: string;
    endDate: string;
    status: string;
    price?: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  className?: string;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "status-active";
    case "renewed":
      return "status-renewed";
    case "expired":
      return "status-expired";
    case "due to renew":
    case "due":
      return "status-due";
    default:
      return "status-inactive";
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "due to renew":
      return "DUE TO RENEW";
    case "renewed":
      return "RENEWED";
    case "expired":
      return "EXPIRED";
    case "active":
      return "ACTIVE";
    default:
      return status.toUpperCase();
  }
};

export function PolicyCard({
  policy,
  onEdit,
  onDelete,
  onView,
  className,
}: PolicyCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const isExpired = new Date(policy.endDate) < new Date();
  const isDueToRenew =
    new Date(policy.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card
      className={cn(
        "mobile-card overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.98]",
        isExpired && "opacity-75",
        className
      )}
      onClick={onView}
    >
      <CardContent className="p-4">
        {/* Header with policy number and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {policy.policyNumber}
            </p>
            <h3 className="text-lg font-semibold text-foreground truncate">
              {policy.vehicleInfo.make} {policy.vehicleInfo.model}
            </h3>
          </div>

          <div className="flex items-center gap-2 ml-3">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium px-2 py-1",
                getStatusVariant(policy.status)
              )}
            >
              {getStatusLabel(policy.status)}
            </Badge>

            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onView();
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      Edit Policy
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="text-destructive"
                    >
                      Delete Policy
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Vehicle info */}
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <Car className="h-4 w-4" />
          <span className="text-sm">
            {policy.vehicleInfo.yearOfManufacture} Model
          </span>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Start:</span>
              <span className="ml-1 font-medium">
                {formatDate(policy.startDate)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">End:</span>
            <span
              className={cn(
                "font-medium",
                isExpired
                  ? "text-destructive"
                  : isDueToRenew
                  ? "text-amber-600"
                  : "text-foreground"
              )}
            >
              {formatDate(policy.endDate)}
            </span>
          </div>
        </div>

        {/* Price if available */}
        {policy.price && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Premium</span>
              <span className="text-lg font-semibold text-primary">
                £{policy.price.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
