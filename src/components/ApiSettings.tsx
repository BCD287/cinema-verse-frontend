
import { useState } from 'react';
import { API_URL, updateApiUrl, DEFAULT_API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
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
    let formattedUrl = apiUrl.trim();
    
    // If URL doesn't start with http:// or https://, add it
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Remove trailing slash if present
    if (formattedUrl.endsWith('/')) {
      formattedUrl = formattedUrl.slice(0, -1);
    }
    
    updateApiUrl(formattedUrl);
    setOpen(false);
    
    // Show toast
    toast({
      title: "API URL Updated",
      description: `The API URL has been set to: ${formattedUrl}`,
    });
    
    // Reload the page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleReset = () => {
    setApiUrl(DEFAULT_API_URL);
    toast({
      title: "Default URL Restored",
      description: "The API URL has been reset to the default value.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">API Settings</span>
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
          <Alert className="mb-4">
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
              <Label htmlFor="apiUrl">API URL</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-xs h-7 px-2"
              >
                Reset to Default
              </Button>
            </div>
            <Input
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="Enter API URL"
            />
            <p className="text-xs text-muted-foreground">
              Current: {API_URL}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
