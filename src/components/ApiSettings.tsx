
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, updateApiUrl, DEFAULT_API_URL } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, AlertTriangle } from 'lucide-react';

export function ApiSettings() {
  const [open, setOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(API_URL);
  const { toast } = useToast();
  const isNgrokUrl = apiUrl.includes('ngrok');

  const handleSave = () => {
    // Trim whitespace and ensure URL format
    const trimmedUrl = apiUrl.trim();
    
    // Basic URL validation
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      toast({
        title: "Invalid URL",
        description: "API URL must start with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    updateApiUrl(trimmedUrl);
    setOpen(false);
    toast({
      title: "Settings updated",
      description: "API URL has been updated successfully.",
    });
    // Reload the page to ensure all components use the new API URL
    window.location.reload();
  };

  const handleReset = () => {
    setApiUrl(DEFAULT_API_URL);
    updateApiUrl(DEFAULT_API_URL);
    setOpen(false);
    toast({
      title: "Settings reset",
      description: "API URL has been reset to default.",
    });
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure the backend API URL. The application will reload after saving.
          </DialogDescription>
        </DialogHeader>
        
        {isNgrokUrl && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>CORS Warning</AlertTitle>
            <AlertDescription>
              You're using an ngrok URL. Make sure your backend has CORS properly configured to accept requests from {window.location.origin}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="apiUrl" className="text-sm font-medium">
                API URL
              </label>
              <span className="text-xs text-muted-foreground">
                Current: {API_URL.length > 30 ? API_URL.substring(0, 30) + '...' : API_URL}
              </span>
            </div>
            <Input
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api-url.example.com"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleReset}
          >
            Reset to Default
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
