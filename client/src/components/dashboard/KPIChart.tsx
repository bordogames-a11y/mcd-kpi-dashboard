import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KPIData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPIChartProps {
  data: KPIData[];
}

export function KPIChart({ data }: KPIChartProps) {
  // Prepare data for chart - we need to handle different units potentially, 
  // but for a simple visualization, we can just plot raw numbers or normalize.
  // Mixing % and raw numbers in one chart is bad.
  // Let's filter to just show the first 5 metrics or similar to avoid clutter, 
  // OR just show "Percent" metrics in one chart and "Count" in another.
  // For simplicity in this mockup, let's just plot them and let the user see the scale difference 
  // (or better, just show the Deviation % ? No, Target vs Actual is requested).
  
  // Better approach: A normalized "Performance %" chart? (Actual / Target * 100)
  // Let's stick to a simple Target vs Actual for now, but maybe just for the first few items 
  // or allow the user to see it.
  
  // Actually, let's just render the data. Recharts handles auto-scaling Y-axis, 
  // but if we have 500 (Count) and 1.0 (Error rate), the 1.0 will be invisible.
  // Let's split into two charts if needed, or just show a "Performance Overview" 
  // which calculates % achievement.
  
  const chartData = data.map(d => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
    full_name: d.name,
    Hedef: d.target,
    Gerçekleşen: d.actual,
    // Calculate achievement % for a normalized view?
    // achievement: (d.actual / d.target) * 100
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performans Grafiği</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
              />
              <Legend />
              <Bar dataKey="Hedef" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Gerçekleşen" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
