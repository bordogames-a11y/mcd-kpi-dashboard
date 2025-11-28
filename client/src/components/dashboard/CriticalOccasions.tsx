import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, AlertCircle, Check, X } from "lucide-react";
import { occasionAPI } from "@/lib/api";
import type { CriticalOccasion } from "@shared/schema";

const CRITICAL_PRODUCTS = ["Ayran", "Salata", "Shake Süt", "Sundae Süt"];

export function CriticalOccasions() {
  const [occasions, setOccasions] = useState<CriticalOccasion[]>([]);
  const [customEntry, setCustomEntry] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customIsCritical, setCustomIsCritical] = useState("no");
  const [sktNotes, setSktNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCriticalProduct, setSelectedCriticalProduct] = useState<string | null>(null);
  const [criticalProductSKT, setCriticalProductSKT] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchOccasions();
  }, []);

  const fetchOccasions = async () => {
    try {
      const data = await occasionAPI.getAll();
      setOccasions(data);
    } catch (error) {
      console.error("Failed to fetch critical occasions:", error);
      toast({
        title: "Hata",
        description: "Kritik olaylar yüklenemedi.",
        variant: "destructive",
      });
    }
  };

  const handleSelectCriticalProduct = (product: string) => {
    setSelectedCriticalProduct(product);
    setCriticalProductSKT("");
  };

  const handleSaveCriticalProduct = async () => {
    if (!selectedCriticalProduct) return;

    try {
      setIsAdding(true);
      const created = await occasionAPI.create({
        title: selectedCriticalProduct,
        subUnit: selectedCriticalProduct,
        description: criticalProductSKT || undefined,
        isCritical: "yes",
      });
      setOccasions((prev) => [...prev, created]);
      setSelectedCriticalProduct(null);
      setCriticalProductSKT("");
      toast({
        title: "Başarılı",
        description: `${selectedCriticalProduct} eklendi.`,
      });
    } catch (error) {
      console.error("Failed to create occasion:", error);
      toast({
        title: "Hata",
        description: "Ürün eklenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddCustom = async () => {
    if (!customEntry.trim()) {
      toast({
        title: "Hata",
        description: "Ürün adı boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAdding(true);
      const created = await occasionAPI.create({
        title: customEntry,
        subUnit: customEntry,
        description: customDescription || undefined,
        isCritical: customIsCritical as "yes" | "no",
      });
      setOccasions((prev) => [...prev, created]);
      setCustomEntry("");
      setCustomDescription("");
      setCustomIsCritical("no");
      toast({
        title: "Başarılı",
        description: "Özel ürün eklendi.",
      });
    } catch (error) {
      console.error("Failed to create custom occasion:", error);
      toast({
        title: "Hata",
        description: "Özel ürün eklenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveSKT = async () => {
    if (!sktNotes.trim()) {
      toast({
        title: "Hata",
        description: "S.K.T. notları boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const created = await occasionAPI.create({
        title: `S.K.T. - ${new Date().toLocaleString("tr-TR")}`,
        description: sktNotes,
      });
      setOccasions((prev) => [...prev, created]);
      setSktNotes("");
      toast({
        title: "Başarılı",
        description: "S.K.T. kaydedildi.",
      });
    } catch (error) {
      console.error("Failed to save S.K.T.:", error);
      toast({
        title: "Hata",
        description: "S.K.T. kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await occasionAPI.delete(id);
      setOccasions((prev) => prev.filter((o) => o.id !== id));
      toast({
        title: "Başarılı",
        description: "Olay silindi.",
      });
    } catch (error) {
      console.error("Failed to delete occasion:", error);
      toast({
        title: "Hata",
        description: "Olay silinemedi.",
        variant: "destructive",
      });
    }
  };

  const isCriticalProductAdded = (product: string) => {
    return occasions.some((o) => o.subUnit === product);
  };

  return (
    <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
      <CardHeader>
        <CardTitle className="text-red-700 dark:text-red-300">SKT KRİTİK OLANLAR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Kritik Ürünler Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Kritik Ürünler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CRITICAL_PRODUCTS.map((product) => (
              <Button
                key={product}
                onClick={() => handleSelectCriticalProduct(product)}
                disabled={isAdding || isCriticalProductAdded(product)}
                variant={isCriticalProductAdded(product) ? "default" : selectedCriticalProduct === product ? "secondary" : "outline"}
                className="text-xs h-9"
                data-testid={`button-add-critical-${product}`}
              >
                {isCriticalProductAdded(product) ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    {product}
                  </>
                ) : (
                  product
                )}
              </Button>
            ))}
          </div>

          {/* Critical Product S.K.T. Input Section */}
          {selectedCriticalProduct && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-md border border-red-200 dark:border-red-800/50 mt-4">
              <h4 className="font-semibold text-sm text-foreground mb-3">{selectedCriticalProduct} - S.K.T.</h4>
              <textarea
                placeholder="S.K.T. Notlarını Girin"
                value={criticalProductSKT}
                onChange={(e) => setCriticalProductSKT(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleSaveCriticalProduct}
                  disabled={isAdding}
                  className="flex-1 gap-1"
                  size="sm"
                >
                  <Check className="w-4 h-4" />
                  Kaydet
                </Button>
                <Button
                  onClick={() => {
                    setSelectedCriticalProduct(null);
                    setCriticalProductSKT("");
                  }}
                  variant="outline"
                  className="flex-1 gap-1"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                  İptal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Product Section */}
        <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-md border border-red-100 dark:border-red-800/50">
          <h3 className="font-semibold text-sm text-foreground">Özel Ürün Ekle</h3>
          <Input
            placeholder="Ürün Adı"
            value={customEntry}
            onChange={(e) => setCustomEntry(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCustom()}
          />
          <Input
            placeholder="SKT Tarihi"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCustom()}
          />
          <select
            value={customIsCritical}
            onChange={(e) => setCustomIsCritical(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
          >
            <option value="no">Normal</option>
            <option value="yes">Kritik !</option>
          </select>
          <Button
            onClick={handleAddCustom}
            disabled={isAdding}
            className="gap-1 w-full"
          >
            <Plus className="w-4 h-4" />
            Ekle
          </Button>
        </div>

        {/* Aksiyon Planı Section */}
        <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-md border border-red-100 dark:border-red-800/50">
          <h3 className="font-semibold text-sm text-foreground">Aksiyon Planı</h3>
          <textarea
            placeholder="Aksiyon planlarını not alın"
            value={sktNotes}
            onChange={(e) => setSktNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSaveSKT}
              disabled={isSaving}
              className="flex-1 gap-1"
              variant="default"
            >
              <Check className="w-4 h-4" />
              Kaydet
            </Button>
            <Button
              onClick={handleSaveSKT}
              disabled={isSaving}
              className="flex-1 gap-1"
              variant="secondary"
            >
              <Plus className="w-4 h-4" />
              İşle
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold text-sm text-foreground">Kayıtlı Olaylar</h3>
          {occasions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Henüz olay eklenmedi.</p>
          ) : (
            occasions.map((occasion) => (
              <div
                key={occasion.id}
                className={`flex items-start justify-between p-3 rounded-md border ${
                  occasion.isCritical === "yes"
                    ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                    : "bg-white dark:bg-slate-900 border-red-100 dark:border-red-800/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {occasion.isCritical === "yes" && (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 font-bold" />
                    )}
                    <p className="font-semibold text-sm text-foreground truncate">{occasion.title}</p>
                  </div>
                  {occasion.subUnit && (
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                      Ürün: {occasion.subUnit}
                    </p>
                  )}
                  {occasion.description && (
                    <p className="text-xs text-muted-foreground mt-1 break-words">{occasion.description}</p>
                  )}
                  {!CRITICAL_PRODUCTS.includes(occasion.subUnit || "") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(occasion.createdAt).toLocaleString("tr-TR")}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 flex-shrink-0"
                  onClick={() => handleDelete(occasion.id)}
                  data-testid="button-delete-critical"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
