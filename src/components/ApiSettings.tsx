
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
import { Settings } from 'lucide-react';

export function ApiSettings() {
  const [open, setOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(API_URL);
  const { toast } = useToast();

  const handleSave = () => {
    updateApiUrl(apiUrl);
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
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="apiUrl" className="text-sm font-medium">
              API URL
            </label>
            <Input
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:5000"
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
