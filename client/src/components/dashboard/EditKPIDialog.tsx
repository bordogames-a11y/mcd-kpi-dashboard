import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKPIs } from "@/context/KPIContext";
import { kpiCategories } from "@shared/schema";
import type { KPI, InsertKPI } from "@shared/schema";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface EditKPIDialogProps {
  kpi?: KPI;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
}

export function EditKPIDialog({ kpi, open, onOpenChange, defaultCategory }: EditKPIDialogProps) {
  const { addKPI, updateKPI, deleteKPI } = useKPIs();
  const isEditing = !!kpi;

  const [formData, setFormData] = useState<Partial<InsertKPI>>({
    name: "",
    target: 0,
    actual: 0,
    period: "Günlük",
    unit: "",
    category: (defaultCategory as any) || "Operasyon",
    position: 0,
  });

  useEffect(() => {
    if (kpi) {
      setFormData({
        name: kpi.name,
        target: kpi.target,
        actual: kpi.actual,
        period: kpi.period,
        unit: kpi.unit || "",
        category: kpi.category,
        position: kpi.position,
      });
    } else {
      setFormData({
        name: "",
        target: 0,
        actual: 0,
        period: "Günlük",
        unit: "",
        category: (defaultCategory as any) || "Operasyon",
        position: 0,
      });
    }
  }, [kpi, defaultCategory, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && kpi) {
      await updateKPI(kpi.id, formData);
    } else {
      await addKPI(formData as InsertKPI);
    }
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (kpi) {
      await deleteKPI(kpi.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "KPI Düzenle" : "Yeni KPI Ekle"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Mevcut KPI değerlerini güncelleyin."
              : "Takip etmek istediğiniz yeni bir metrik ekleyin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                KPI Adı
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Kategori
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {kpiCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">
                Hedef
              </Label>
              <Input
                id="target"
                type="number"
                step="any"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actual" className="text-right">
                Gerçekleşen
              </Label>
              <Input
                id="actual"
                type="number"
                step="any"
                value={formData.actual}
                onChange={(e) => setFormData({ ...formData, actual: parseFloat(e.target.value) || 0 })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Dönem
              </Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Dönem seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Günlük">Günlük</SelectItem>
                  <SelectItem value="Haftalık">Haftalık</SelectItem>
                  <SelectItem value="Aylık">Aylık</SelectItem>
                  <SelectItem value="Yıllık">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Birim
              </Label>
              <Select
                value={formData.unit || "none"}
                onValueChange={(value) => setFormData({ ...formData, unit: value === "none" ? "" : value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Birim seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  <SelectItem value="%">% (Yüzde)</SelectItem>
                  <SelectItem value="sn">sn (Saniye)</SelectItem>
                  <SelectItem value="gün">gün (Gün)</SelectItem>
                  <SelectItem value="TL">₺ (Türk Lirası)</SelectItem>
                  <SelectItem value="EURO">€ (Euro)</SelectItem>
                  <SelectItem value="DOLLAR">$ (Dolar)</SelectItem>
                  <SelectItem value="POUND">£ (Pound)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {isEditing ? (
              <Button type="button" variant="destructive" onClick={handleDelete} size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : <div></div>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit">Kaydet</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
