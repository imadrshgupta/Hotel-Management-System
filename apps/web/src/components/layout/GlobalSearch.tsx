import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { guestsApi, reservationsApi, roomsApi, invoicesApi } from "@/services/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { Search, User, CalendarDays, BedDouble, FileText, ArrowRight, Loader2 } from "lucide-react";
import type { Guest, Reservation, Room, Invoice } from "@/types";

const MIN_QUERY_LENGTH = 2;

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const enabled = query.trim().length >= MIN_QUERY_LENGTH;

  // Each query is debounced upstream by SearchInput (300ms) — the server is
  // only hit after the user pauses typing. Each module uses its own search
  // param as implemented by the backend (see services/api.ts).
  const guestsQuery = useQuery({
    queryKey: ["global-search", "guests", query],
    queryFn: () => guestsApi.list({ search: query, limit: 5 }),
    enabled,
  });
  const reservationsQuery = useQuery({
    queryKey: ["global-search", "reservations", query],
    queryFn: () => reservationsApi.list({ confirmation_number: query, limit: 5 }),
    enabled,
  });
  const roomsQuery = useQuery({
    queryKey: ["global-search", "rooms", query],
    queryFn: () => roomsApi.list({ number: query, limit: 5 }),
    enabled,
  });
  const invoicesQuery = useQuery({
    queryKey: ["global-search", "invoices", query],
    queryFn: () => invoicesApi.list({ invoice_number: query, limit: 5 }),
    enabled,
  });

  const isFetching =
    enabled &&
    (guestsQuery.isFetching ||
      reservationsQuery.isFetching ||
      roomsQuery.isFetching ||
      invoicesQuery.isFetching);

  // Close on outside click / Escape
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const guests: Guest[] = guestsQuery.data?.data || [];
  const reservations: Reservation[] = reservationsQuery.data?.data || [];
  const rooms: Room[] = roomsQuery.data?.data || [];
  const invoices: Invoice[] = invoicesQuery.data?.data || [];

  const total =
    guests.length + reservations.length + rooms.length + invoices.length;

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setOpen(v.trim().length >= MIN_QUERY_LENGTH);
        }}
        placeholder="Search guests, rooms, reservations, invoices..."
      />

      {open && (
        <div className="absolute top-full mt-2 w-full min-w-80 max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
          {isFetching ? (
            <div className="flex items-center gap-2 p-4 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : total === 0 ? (
            <div className="p-4 text-xs text-slate-500 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              No matches for “{query}”.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {guests.length > 0 && (
                <SearchGroup label="Guests" icon={<User className="w-3.5 h-3.5" />}>
                  {guests.map((g) => (
                    <SearchRow
                      key={g.id}
                      title={`${g.first_name} ${g.last_name}`}
                      subtitle={g.email || g.phone || g.id_number || ""}
                      onClick={() => go(`/guests/${g.id}`)}
                    />
                  ))}
                </SearchGroup>
              )}

              {reservations.length > 0 && (
                <SearchGroup label="Reservations" icon={<CalendarDays className="w-3.5 h-3.5" />}>
                  {reservations.map((r) => {
                    const guest = r.guests?.[0]?.guest;
                    return (
                      <SearchRow
                        key={r.id}
                        title={r.confirmation_number}
                        subtitle={
                          guest
                            ? `${guest.first_name} ${guest.last_name} • ${r.check_in_date} → ${r.check_out_date}`
                            : `${r.check_in_date} → ${r.check_out_date}`
                        }
                        onClick={() => go(`/reservations/${r.id}`)}
                      />
                    );
                  })}
                </SearchGroup>
              )}

              {rooms.length > 0 && (
                <SearchGroup label="Rooms" icon={<BedDouble className="w-3.5 h-3.5" />}>
                  {rooms.map((r) => (
                    <SearchRow
                      key={r.id}
                      title={`Room ${r.number}`}
                      subtitle={r.roomType?.name || r.name || ""}
                      onClick={() => go("/front-office/room-board")}
                    />
                  ))}
                </SearchGroup>
              )}

              {invoices.length > 0 && (
                <SearchGroup label="Invoices" icon={<FileText className="w-3.5 h-3.5" />}>
                  {invoices.map((inv) => (
                    <SearchRow
                      key={inv.id}
                      title={inv.invoice_number}
                      subtitle={
                        inv.guest
                          ? `${inv.guest.first_name} ${inv.guest.last_name} • ${inv.status}`
                          : inv.status
                      }
                      onClick={() => go("/billing/invoices")}
                    />
                  ))}
                </SearchGroup>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SearchGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SearchGroup: React.FC<SearchGroupProps> = ({ label, icon, children }) => (
  <div className="py-1">
    <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
      {icon}
      {label}
    </p>
    <div>{children}</div>
  </div>
);

interface SearchRowProps {
  title: string;
  subtitle?: string;
  onClick: () => void;
}

const SearchRow: React.FC<SearchRowProps> = ({ title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
  >
    <span className="min-w-0">
      <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
        {title}
      </span>
      {subtitle && (
        <span className="block text-[11px] text-slate-500 truncate">{subtitle}</span>
      )}
    </span>
    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
  </button>
);