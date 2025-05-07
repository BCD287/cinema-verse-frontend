
import { useState, useEffect } from 'react';
import { Seat } from '@/types/cinema';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: number[];
  onSeatSelect: (seatId: number, isReserved: boolean) => void;
  legendVisible?: boolean;
}

export const SeatSelector = ({
  seats,
  selectedSeats,
  onSeatSelect,
  legendVisible = true
}: SeatSelectorProps) => {
  const [showLegend, setShowLegend] = useState(legendVisible);
  
  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);
  
  // Sort rows alphabetically
  const sortedRows = Object.keys(seatsByRow).sort();
  
  // Sort seats within each row by column number
  sortedRows.forEach(row => {
    seatsByRow[row].sort((a, b) => a.column - b.column);
  });
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="screen mb-10"></div>
        
        <div className="flex flex-col items-center space-y-4">
          {sortedRows.map(row => (
            <div key={row} className="flex items-center w-full justify-center">
              <div className="w-8 text-center font-semibold">{row}</div>
              <div className="flex flex-wrap justify-center gap-2">
                {seatsByRow[row].map(seat => (
                  <TooltipProvider key={seat.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "seat transition-all",
                            seat.is_reserved ? "seat-reserved" : (
                              selectedSeats.includes(seat.id) ? "seat-selected" : "seat-available"
                            )
                          )}
                          onClick={() => onSeatSelect(seat.id, seat.is_reserved)}
                          disabled={seat.is_reserved}
                          aria-label={`Seat ${seat.seat_number} ${seat.is_reserved ? "(Already reserved)" : ""}`}
                        >
                          {seat.column}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-black/80 text-white border-none px-3 py-1.5">
                        <p>Seat {seat.seat_number}</p>
                        {seat.is_reserved && <p className="text-xs">Already reserved</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {legendVisible && (
        <div className="relative">
          <div 
            className="flex items-center justify-center cursor-pointer mb-2"
            onClick={() => setShowLegend(!showLegend)}
          >
            <span className="text-sm font-medium mr-2">Seat Legend</span>
            {showLegend ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          
          {showLegend && (
            <div className="flex flex-wrap justify-center gap-6 text-sm bg-black/5 p-3 rounded-md">
              <div className="flex items-center">
                <div className="seat-available w-5 h-5 mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="seat-selected w-5 h-5 mr-2"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <div className="seat-reserved w-5 h-5 mr-2"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-1">
                <Info size={14} />
                <span className="text-xs italic">Click on seats to select/deselect</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
