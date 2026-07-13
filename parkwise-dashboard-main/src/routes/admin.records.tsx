import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/records")({
  component: () => <DashboardLayout role="admin"><Records /></DashboardLayout>,
});

const recordsSessionCache = new Map<string, { content: any[]; totalPages: number }>();

// The Skeleton Loader
function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-12"></div></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-20"></div></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-32"></div></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-32"></div></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
          <TableCell><div className="h-6 bg-muted rounded-full w-16"></div></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function Records() {
  const [q, setQ] = useState("");
  const [site, setSite] = useState("all");
  const [status, setStatus] = useState("all");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedSite, setAppliedSite] = useState("all");
  const [appliedStatus, setAppliedStatus] = useState("all");
  
  const [sites, setSites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  // Pagination & Loading States
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const cacheRef = useRef<Map<string, { content: any[]; totalPages: number }>>(recordsSessionCache);
  const requestIdRef = useRef(0);

  // 1. Fetch sites on initial load
  useEffect(() => {
    adminService.getSites().then((s) => setSites(s)).catch(() => setSites([]));
  }, []);

  const normalizeRecordsResponse = (data: any) => {
    const rawRows = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.records)
          ? data.records
          : [];

    const normalizedRows = rawRows.map((r: any) => ({
      id: r?.id ?? r?.recordId ?? "-",
      location: r?.location ?? r?.siteLocation ?? r?.siteId ?? r?.site?.siteLocation ?? "Unknown",
      slot: r?.slot ?? r?.slotNumber ?? "-",
      plate: r?.plate ?? r?.licensePlate ?? "-",
      checkIn: r?.checkIn ?? r?.parkInTime ?? "",
      checkOut: r?.checkOut ?? r?.parkOutTime ?? "",
      amount: r?.amount ?? 0,
      status:
        r?.status ??
        (r?.isPaid === true ? "Paid" : r?.isPaid === false ? "Unpaid" : "Unknown"),
    }));

    const pages = Number(
      data?.totalPages ??
      data?.total_pages ??
      data?.page?.totalPages ??
      1,
    );

    return {
      content: normalizedRows,
      totalPages: Number.isFinite(pages) && pages > 0 ? pages : 1,
    };
  };

  const makeCacheKey = (currentPage: number, searchQuery: string, siteId: string, statusFilter: string) =>
    `${currentPage}|${searchQuery}|${siteId}|${statusFilter}`;

  const fetchRecords = async (
    currentPage: number,
    searchQuery: string,
    siteId: string,
    statusFilter: string,
    prefetchOnly: boolean = false,
  ) => {
    const cacheKey = makeCacheKey(currentPage, searchQuery, siteId, statusFilter);
    const cached = cacheRef.current.get(cacheKey);

    if (cached && !prefetchOnly) {
      setHistory(cached.content);
      setTotalPages(cached.totalPages);
      setIsLoading(false);
      return;
    }

    let requestId = 0;
    if (!prefetchOnly) {
      requestId = ++requestIdRef.current;
      setIsLoading(true);
    }

    try {
      const raw = await adminService.getRecords(currentPage, 25, searchQuery, siteId, statusFilter);
      const normalized = normalizeRecordsResponse(raw);
      cacheRef.current.set(cacheKey, normalized);

      if (!prefetchOnly && requestId === requestIdRef.current) {
        setHistory(normalized.content);
        setTotalPages(normalized.totalPages);
      }

      const nextPage = currentPage + 1;
      if (!prefetchOnly && nextPage < normalized.totalPages) {
        const nextKey = makeCacheKey(nextPage, searchQuery, siteId, statusFilter);
        if (!cacheRef.current.has(nextKey)) {
          void fetchRecords(nextPage, searchQuery, siteId, statusFilter, true);
        }
      }
    } catch (error) {
      if (!prefetchOnly && requestId === requestIdRef.current) {
        console.error("Failed to load records", error);
        setHistory([]);
        setTotalPages(1);
      }
    } finally {
      if (!prefetchOnly && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Page change uses applied filters only
  useEffect(() => {
    fetchRecords(page, appliedSearch, appliedSite, appliedStatus);
  }, [page, appliedSearch, appliedSite, appliedStatus]);

  // Standard search: only Enter/Search applies filters
  const handleSearch = () => {
    const nextSearch = q.trim();
    const nextSite = site;
    const nextStatus = status;

    setHistory([]);
    setTotalPages(1);
    setIsLoading(true);
    setAppliedSearch(nextSearch);
    setAppliedSite(nextSite);
    setAppliedStatus(nextStatus);
    setPage(0);

    // If already on first page, page effect won't fire on state no-op in some cases.
    // Trigger immediate fetch to keep UX snappy.
    if (page === 0) {
      fetchRecords(0, nextSearch, nextSite, nextStatus);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Parking Records" description="Search and filter every parking session." />

      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        {/* FILTERS */}
        <div className="p-4 border-b border-border grid sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search plate..." 
              className="pl-9"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="sm:col-span-3">
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger><SelectValue placeholder="Site" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sites</SelectItem>
                {sites.map((s) => <SelectItem key={s.siteId} value={s.siteId}>{s.siteLocation}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
             <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
             </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Site</TableHead><TableHead>Slot</TableHead>
              <TableHead>Plate</TableHead><TableHead>Check-in</TableHead><TableHead>Check-out</TableHead>
              <TableHead>Bill</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {isLoading && history.length === 0 ? (
                <TableSkeleton rows={8} />
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No parking records found.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.location}</TableCell>
                    <TableCell>{r.slot}</TableCell>
                    <TableCell className="font-medium">{r.plate}</TableCell>
                    <TableCell className="text-xs">{r.checkIn}</TableCell>
                    <TableCell className="text-xs">{r.checkOut}</TableCell>
                    <TableCell>Rs {r.amount}</TableCell>
                    <TableCell>
                      <Badge className={r.status === "Paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}