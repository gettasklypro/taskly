import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export const AdminPromos = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");

  const queryClient = useQueryClient();

  const { data: promos, isLoading } = useQuery({
    queryKey: ["admin-promos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPromo: any) => {
      // First, create the discount in Paddle
      const { data: paddleData, error: paddleError } = await supabase.functions.invoke('create-paddle-discount', {
        body: {
          code: newPromo.code,
          discount_value: newPromo.discount_value,
          discount_type: newPromo.discount_type,
          expires_at: newPromo.expires_at,
          max_uses: newPromo.max_uses
        }
      });

      if (paddleError || !paddleData?.success) {
        throw new Error(paddleData?.error || 'Failed to create discount in Paddle');
      }

      // Then create the promo code in our database with Paddle discount ID
      const { error } = await supabase.from("promo_codes").insert({
        ...newPromo,
        paddle_discount_id: paddleData.paddleDiscountId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
      toast.success("Promo code created and synced to Paddle successfully");
      setOpen(false);
      setCode("");
      setDiscountValue("");
      setExpiresAt("");
      setMaxUses("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create promo code");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
      toast.success("Promo code deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete promo code");
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      code: code.toUpperCase(),
      discount_value: parseFloat(discountValue),
      discount_type: discountType,
      expires_at: expiresAt || null,
      max_uses: maxUses ? parseInt(maxUses) : null,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Promos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Promo Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CLEAN10"
                />
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expires At</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              <div>
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="100"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Promo Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : promos?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No promo codes found
                </TableCell>
              </TableRow>
            ) : (
              promos?.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.code}</TableCell>
                  <TableCell>
                    {promo.discount_value}
                    {promo.discount_type === "percent" ? "%" : "£"}
                  </TableCell>
                  <TableCell className="capitalize">{promo.discount_type}</TableCell>
                  <TableCell>
                    {promo.expires_at
                      ? new Date(promo.expires_at).toLocaleDateString()
                      : "No expiry"}
                  </TableCell>
                  <TableCell>
                    {promo.current_uses}/{promo.max_uses || "∞"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={
                        promo.status === "active" ? "bg-green-500" : "bg-gray-500"
                      }
                    >
                      {promo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(promo.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
