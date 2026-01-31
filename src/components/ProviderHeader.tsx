"use client";

import { Star, MapPin, Clock, Video } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProviderHeader() {
  return (
    <Card className="p-6 rounded-xl">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
            SS
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-foreground">
              Dr. Sarah Smith
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Video className="w-3 h-3" />
              Telehealth
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-0.5">
            Family Medicine &middot; Board Certified
          </p>

          <div className="flex items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground flex-wrap">
            {/* Rating */}
            <span className="inline-flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">4.9</span>
              <span>(127 reviews)</span>
            </span>

            {/* Location */}
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Austin, TX
            </span>

            {/* Next available */}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Next available today
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
