
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Movie, uploadPoster } from '@/services/api';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GENRES } from '@/lib/constants';

// Create schema for form validation
const movieSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be 1000 characters or less'),
  poster_url: z.string().min(1, 'Poster URL is required'),
  genre: z.string().min(1, 'Genre is required'),
  release_date: z.string().min(1, 'Release date is required'),
});

type MovieFormValues = z.infer<typeof movieSchema>;

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (data: MovieFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const MovieForm = ({
  movie,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save Movie',
}: MovieFormProps) => {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [posterPreview, setPosterPreview] = useState<string>('');
  const { toast } = useToast();

  // Initialize the form with default values or existing movie data
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: movie?.title || '',
      description: movie?.description || '',
      poster_url: movie?.poster_url || '',
      genre: movie?.genre || '',
      release_date: movie?.release_date 
        ? format(new Date(movie.release_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
    }
  });
  
  // Update preview when poster URL changes
  useEffect(() => {
    if (movie?.poster_url) {
      setPosterPreview(movie.poster_url);
    }
  }, [movie]);

  // Handle poster file selection
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
      
      // Note: We don't update form value yet, it will be uploaded on submit
    }
  };

  // Handle poster upload
  const handleUploadPoster = async () => {
    if (!posterFile) return null;
    
    setIsUploading(true);
    try {
      const result = await uploadPoster(posterFile);
      form.setValue('poster_url', result.url);
      toast({
        title: 'Success',
        description: 'Poster uploaded successfully',
      });
      return result.url;
    } catch (error) {
      console.error('Failed to upload poster:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload poster',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (values: MovieFormValues) => {
    try {
      // If there's a new poster file, upload it first
      if (posterFile) {
        const posterUrl = await handleUploadPoster();
        if (posterUrl) {
          values.poster_url = posterUrl;
        }
      }
      
      // Submit the form data
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save movie',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Title field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title*</FormLabel>
              <FormControl>
                <Input placeholder="Enter movie title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter movie description" 
                  {...field}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Genre selection */}
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Release Date field */}
        <FormField
          control={form.control}
          name="release_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Release Date*</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Poster URL and upload */}
        <FormField
          control={form.control}
          name="poster_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poster Image*</FormLabel>
              <div className="flex flex-col space-y-2">
                {/* Current poster preview */}
                {posterPreview && (
                  <div className="relative w-40 h-60 mb-4 overflow-hidden rounded-md border">
                    <img 
                      src={posterPreview} 
                      alt="Movie poster preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* File input for new poster */}
                <div className="flex flex-col space-y-2">
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handlePosterChange}
                    className="max-w-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a new poster, or enter URL below
                  </p>
                </div>
                
                {/* Manual URL input */}
                <FormControl>
                  <Input 
                    placeholder="Poster URL" 
                    {...field}
                    className="max-w-md" 
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="bg-cinema-accent hover:bg-cinema-accent/90"
          >
            {(isSubmitting || isUploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
