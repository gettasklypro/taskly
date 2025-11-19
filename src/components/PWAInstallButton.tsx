import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import appleLogo from "@/assets/apple-logo.png";
import androidLogo from "@/assets/android-logo.png";

interface PWAInstallButtonProps {
  platform: "ios" | "android";
}

export const PWAInstallButton = ({ platform }: PWAInstallButtonProps) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleClick = () => {
    setShowInstructions(true);
  };

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const getInstructions = () => {
    if (platform === "ios" && isIOS) {
      return (
        <div className="space-y-4 text-sm">
          <p className="font-semibold">To install Taskly on your iPhone:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Tap the <strong>Share</strong> button (square with arrow pointing up) at the bottom of Safari</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top right corner</li>
            <li>Taskly will now appear on your home screen like a native app!</li>
          </ol>
        </div>
      );
    }
    
    if (platform === "android" && isAndroid) {
      return (
        <div className="space-y-4 text-sm">
          <p className="font-semibold">To install Taskly on your Android device:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Tap the <strong>menu button</strong> (three dots) in your browser</li>
            <li>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
            <li>Tap <strong>"Add"</strong> or <strong>"Install"</strong></li>
            <li>Taskly will now appear on your home screen like a native app!</li>
          </ol>
        </div>
      );
    }

    return (
      <div className="space-y-4 text-sm">
        <p className="font-semibold">To install Taskly:</p>
        <p className="text-muted-foreground">
          Please open this page on your {platform === "ios" ? "iPhone or iPad" : "Android device"} to install the app.
        </p>
      </div>
    );
  };

  console.log('PWAInstallButton rendering for platform:', platform);

  return (
    <>
      <Button
        variant="outline"
        className="justify-start gap-2 h-10 px-4 bg-background hover:bg-accent/50 border border-border text-sm"
        onClick={handleClick}
      >
        <img 
          src={platform === "ios" ? appleLogo : androidLogo} 
          alt={platform === "ios" ? "Apple" : "Android"}
          className="h-4 w-4 object-contain brightness-0 dark:brightness-0 dark:invert"
          onError={(e) => console.error('Image failed to load:', platform)}
        />
        <span className="font-medium whitespace-nowrap">
          Install on {platform === "ios" ? "iOS" : "Android"}
        </span>
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Taskly</DialogTitle>
            <DialogDescription>
              Add Taskly to your home screen for quick access
            </DialogDescription>
          </DialogHeader>
          {getInstructions()}
        </DialogContent>
      </Dialog>
    </>
  );
};
