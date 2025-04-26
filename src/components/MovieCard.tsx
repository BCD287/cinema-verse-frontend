
import { Link } from 'react-router-dom';
import { Movie } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className = '' }: MovieCardProps) {
  return (
    <Card className={`movie-card ${className} h-full flex flex-col`}>
      <div className="overflow-hidden aspect-[2/3] relative">
        <img 
          src={movie.poster_url || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070'} 
          alt={movie.title}
          className="movie-poster transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070';
          }}
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-cinema-accent hover:bg-cinema-accent/90">{movie.genre}</Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{movie.title}</h3>
          <p className="text-muted-foreground text-xs mb-2">
            {movie.release_date && format(parseISO(movie.release_date), 'MMMM d, yyyy')}
          </p>
          <p className="text-sm line-clamp-2">{movie.description}</p>
        </div>
        <Link 
          to={`/movies/${movie.id}`}
          className="mt-3 text-sm font-medium text-cinema-accent hover:underline"
        >
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
