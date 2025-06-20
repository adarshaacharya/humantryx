import { Card, CardContent } from "@/components/ui/card";

export function NewsLoading() {
  return [...Array(3)].map((_, i) => (
    <Card key={i} className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-muted h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-4 w-3/4 rounded" />
            <div className="bg-muted h-3 w-1/2 rounded" />
            <div className="bg-muted h-3 w-1/4 rounded" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="bg-muted h-3 rounded" />
          <div className="bg-muted h-3 w-5/6 rounded" />
          <div className="bg-muted h-3 w-4/6 rounded" />
        </div>
      </CardContent>
    </Card>
  ));
}
