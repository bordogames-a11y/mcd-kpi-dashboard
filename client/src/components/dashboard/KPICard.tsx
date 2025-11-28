import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateStatus, formatValue, type KPIData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditKPIDialog } from "./EditKPIDialog";

interface KPICardProps {
  kpi: KPIData;
}

export function KPICard({ kpi }: KPICardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const status = calculateStatus(kpi.target, kpi.actual);
  const deviation = kpi.actual - kpi.target;
  
  return (
    <>
      <Card className="overflow-hidden border-l-4 transition-all hover:shadow-md group relative" style={{ 
        borderLeftColor: status === 'success' ? 'var(--chart-3)' : status === 'warning' ? 'var(--chart-2)' : status === 'neutral' ? 'var(--chart-4)' : 'var(--chart-1)' 
      }}>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsDialogOpen(true)}>
            <Edit2 className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground truncate pr-8">
            {kpi.name}
          </CardTitle>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-semibold uppercase",
            status === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
            status === 'warning' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
            status === 'neutral' ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" :
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {kpi.period}
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading">
            {formatValue(kpi.actual, kpi.unit)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={cn(
              "flex items-center font-medium mr-2",
              status === 'success' ? "text-green-600 dark:text-green-400" :
              status === 'warning' ? "text-yellow-600 dark:text-yellow-400" :
              status === 'neutral' ? "text-gray-600 dark:text-gray-400" :
              "text-red-600 dark:text-red-400"
            )}>
              {deviation > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : 
               deviation < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : 
               <Minus className="h-3 w-3 mr-1" />}
              {formatValue(Math.abs(deviation), kpi.unit)}
            </span>
            <span>Hedef: {formatValue(kpi.target, kpi.unit)}</span>
          </div>
        </CardContent>
      </Card>

      <EditKPIDialog 
        kpi={kpi} 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
}
