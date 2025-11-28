import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateStatus, formatValue, type KPIData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { EditKPIDialog } from "./EditKPIDialog";
import { useKPIs } from "@/context/KPIContext";

interface KPITableProps {
  data: KPIData[];
}

export function KPITable({ data }: KPITableProps) {
  const [editingKPI, setEditingKPI] = useState<KPIData | null>(null);
  const { moveKPI } = useKPIs();

  return (
    <div className="rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold text-foreground w-[35%]">KPI Adı</TableHead>
            <TableHead>Dönem</TableHead>
            <TableHead className="text-right">Hedef</TableHead>
            <TableHead className="text-right">Gerçekleşen</TableHead>
            <TableHead className="text-right">Sapma</TableHead>
            <TableHead className="text-center w-[100px]">Durum</TableHead>
            <TableHead className="w-[100px] text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const status = calculateStatus(item.target, item.actual);
            const deviation = item.actual - item.target;
            
            return (
              <TableRow key={item.id} className="group hover:bg-muted/5">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{item.period}</TableCell>
                <TableCell className="text-right font-mono">{formatValue(item.target, item.unit)}</TableCell>
                <TableCell className="text-right font-bold font-mono">{formatValue(item.actual, item.unit)}</TableCell>
                <TableCell className={cn("text-right font-mono font-medium",
                  deviation > 0 ? "text-green-600" : deviation < 0 ? "text-red-600" : "text-gray-500"
                )}>
                  {deviation > 0 ? "+" : ""}{formatValue(deviation, item.unit)}
                </TableCell>
                <TableCell className="text-center">
                  <div className={cn(
                    "mx-auto h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-card",
                    status === 'success' ? "bg-green-500 ring-green-200" :
                    status === 'warning' ? "bg-yellow-400 ring-yellow-200" :
                    "bg-red-500 ring-red-200"
                  )} title={status === 'success' ? "Hedefin Üzerinde" : status === 'warning' ? "Hedefe Yakın" : "Hedefin Altında"} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => moveKPI(item.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => moveKPI(item.id, 'down')}
                      disabled={index === data.length - 1}
                    >
                      <ArrowDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setEditingKPI(item)}
                    >
                      <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <EditKPIDialog 
        kpi={editingKPI || undefined} 
        open={!!editingKPI} 
        onOpenChange={(open) => !open && setEditingKPI(null)} 
      />
    </div>
  );
}
