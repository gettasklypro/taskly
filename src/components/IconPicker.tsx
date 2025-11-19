import { useState, useMemo } from "react";
import { icons, Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  trigger?: React.ReactNode;
}

export const IconPicker = ({ value, onChange, trigger }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get all lucide icon names
  const allIcons = useMemo(() => {
    return Object.keys(icons);
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return allIcons;
    return allIcons.filter((iconName) =>
      iconName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allIcons]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  const CurrentIcon = value && icons[value as keyof typeof icons]
    ? icons[value as keyof typeof icons]
    : Sparkles;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start gap-2">
            <CurrentIcon className="h-4 w-4" />
            <span>{value || "Select Icon"}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {filteredIcons.map((iconName) => {
                const Icon = icons[iconName as keyof typeof icons];
                const isSelected = value === iconName;
                
                return (
                  <button
                    key={iconName}
                    onClick={() => handleSelect(iconName)}
                    className={`p-3 rounded-lg border hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 ${
                      isSelected ? "bg-primary/10 border-primary" : ""
                    }`}
                    title={iconName}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] truncate w-full text-center">{iconName}</span>
                  </button>
                );
              })}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No icons found matching "{search}"
              </div>
            )}
          </ScrollArea>
          
          <div className="text-sm text-muted-foreground">
            {filteredIcons.length} of {allIcons.length} icons
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
