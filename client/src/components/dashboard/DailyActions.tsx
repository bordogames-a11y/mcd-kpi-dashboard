import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useKPIs } from "@/context/KPIContext";
import { useState } from "react";
import { Calendar, FileText, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export function DailyActions() {
  const { kpis, resetDailyValues } = useKPIs();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);

  const handleProcess = async () => {
    setIsProcessing(true);
    
    try {
      // Reset values for the next day (this now saves report and resets)
      await resetDailyValues();
      
      setLastProcessed(new Date());
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to process daily report:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const successCount = kpis.filter(k => (k.actual - k.target) >= 0).length;
  const totalCount = kpis.length;
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hidden md:flex">
          <FileText className="w-4 h-4" />
          Günlük Rapor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Günlük Rapor İşlemleri
          </DialogTitle>
          <DialogDescription>
            Bugünün verilerini işleyin ve rapor olarak kaydedin.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Auto Save Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Otomatik Kayıt</Label>
              <p className="text-sm text-muted-foreground">
                Değişiklikleri anlık olarak yedekle
              </p>
            </div>
            <Switch 
              checked={autoSave} 
              onCheckedChange={(checked) => {
                setAutoSave(checked);
                toast({
                  title: checked ? "Otomatik Kayıt Açıldı" : "Otomatik Kayıt Kapatıldı",
                  description: checked ? "Verileriniz arka planda kaydedilecek." : "Manuel kayıt yapmanız gerekecek.",
                });
              }} 
            />
          </div>

          {/* Report Summary Preview */}
          <Card className="p-4 space-y-3 bg-primary/5 border-primary/10">
            <h4 className="font-semibold flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Rapor Özeti ({new Date().toLocaleDateString('tr-TR')})
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between border-b border-dashed pb-1">
                <span className="text-muted-foreground">Toplam KPI:</span>
                <span className="font-medium">{totalCount}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-1">
                <span className="text-muted-foreground">Başarılı:</span>
                <span className="font-medium text-green-600">{successCount}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-1">
                <span className="text-muted-foreground">Başarı Oranı:</span>
                <span className="font-medium">{successRate}%</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-1">
                <span className="text-muted-foreground">Durum:</span>
                <span className="font-medium text-blue-600">Hazır</span>
              </div>
            </div>
          </Card>

          {lastProcessed && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md dark:bg-green-900/20">
              <CheckCircle2 className="w-4 h-4" />
              Son işlem: {lastProcessed.toLocaleTimeString('tr-TR')}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>İptal</Button>
          <Button onClick={handleProcess} disabled={isProcessing} className="gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Raporu İşle ve Kaydet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
