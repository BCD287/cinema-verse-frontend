
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchMovies, searchMovies, Movie } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const genres = [
  'All Genres',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize state from URL params
    const query = searchParams.get('query') || '';
    const genre = searchParams.get('genre') || 'All Genres';
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    setSearchTerm(query);
    setSelectedGenre(genre);
    setCurrentPage(page);
    
    loadMovies(page, query, genre);
  }, [searchParams]);

  const loadMovies = async (page: number, title?: string, genre?: string) => {
    setLoading(true);
    try {
      if ((title && title.trim() !== '') || (genre && genre !== 'All Genres')) {
        const filteredGenre = genre && genre !== 'All Genres' ? genre : '';
        const results = await searchMovies(filteredGenre, title || '');
        setMovies(results);
        setTotalPages(1); // Search doesn't support pagination in this API
      } else {
        const data = await fetchMovies(page, 12);
        setMovies(data.movies);
        setTotalPages(data.total_pages);
        setCurrentPage(data.current_page);
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
      
      // Set demo data in case of error
      setMovies([
        {
          id: 1,
          title: "The Dark Knight",
          description: "Batman fights against the Joker in an epic battle for Gotham City's soul.",
          poster_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070",
          genre: "Action",
          release_date: "2022-01-15"
        },
        {
          id: 2,
          title: "Inception",
          description: "A thief who enters people's dreams to steal their secrets faces his biggest challenge.",
          poster_url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=2070",
          genre: "Sci-Fi",
          release_date: "2022-02-20"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set('query', searchTerm);
    if (selectedGenre !== 'All Genres') newParams.set('genre', selectedGenre);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All Genres') {
      newParams.delete('genre');
    } else {
      newParams.set('genre', value);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink 
                  isActive={currentPage === pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Movies</h1>
        
        <div className="bg-card rounded-lg p-4 mb-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies by title..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedGenre} onValueChange={handleGenreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="bg-cinema-accent hover:bg-cinema-accent/90">
              Search
            </Button>
          </form>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-[2/3]"></div>
                <div className="h-4 bg-gray-200 rounded mt-4 w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded mt-2 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No movies found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              onClick={() => {
                setSearchParams({});
                setSearchTerm('');
                setSelectedGenre('All Genres');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        {renderPagination()}
      </div>
      
      <Footer />
    </div>
  );
};

export default MovieList;
