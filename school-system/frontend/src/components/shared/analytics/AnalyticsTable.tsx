import { useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { analyticsColors } from "../../../lib/analyticsTheme";
import { useNotifications } from "../notifications/NotificationContext";

export interface AnalyticsTableColumn<T> {
  id: keyof T & string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  value?: (row: T) => unknown;
  render?: (row: T) => ReactNode;
  exportValue?: (row: T) => string | number | null | undefined;
  filterable?: boolean;
}

export interface AnalyticsTableProps<T> {
  columns: AnalyticsTableColumn<T>[];
  rows: T[];
  getRowId?: (row: T, index: number) => string | number;
  title?: ReactNode;
  filterable?: boolean;
  filterPlaceholder?: string;
  exportable?: boolean;
  exportFilename?: string;
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
  emptyMessage?: ReactNode;
}

type SortDirection = "asc" | "desc";

function getColumnValue<T>(column: AnalyticsTableColumn<T>, row: T): unknown {
  if (column.value) return column.value(row);
  return row[column.id];
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
}

function csvCell(value: unknown): string {
  const rawText = value == null ? "" : String(value);
  const text =
    typeof value === "string" && /^[\s]*[=+\-@]/.test(rawText)
      ? `'${rawText}`
      : rawText;
  return `"${text.replaceAll('"', '""')}"`;
}

export function AnalyticsTable<T>({
  columns,
  rows,
  getRowId,
  title,
  filterable = false,
  filterPlaceholder = "Filter rows",
  exportable = false,
  exportFilename = "analytics.csv",
  rowsPerPageOptions = [10, 25, 50],
  initialRowsPerPage = 10,
  emptyMessage = "No data available.",
}: AnalyticsTableProps<T>) {
  const toast = useNotifications();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortBy, setSortBy] = useState<keyof T & string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredRows = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase();
    const matching = query
      ? rows.filter((row) =>
          columns.some((column) => {
            if (column.filterable === false) return false;
            const value = getColumnValue(column, row);
            return value != null && String(value).toLocaleLowerCase().includes(query);
          }),
        )
      : rows;

    if (!sortBy) return matching;
    const sortColumn = columns.find((column) => column.id === sortBy);
    if (!sortColumn) return matching;

    return [...matching].sort((left, right) => {
      const result = compareValues(
        getColumnValue(sortColumn, left),
        getColumnValue(sortColumn, right),
      );
      return sortDirection === "asc" ? result : -result;
    });
  }, [columns, filter, rows, sortBy, sortDirection]);

  const pageRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage],
  );

  const toggleSort = (column: AnalyticsTableColumn<T>) => {
    if (column.sortable === false) return;
    if (sortBy === column.id) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column.id);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const exportCsv = () => {
    try {
    const header = columns.map((column) => csvCell(column.header));
    const dataRows = filteredRows.map((row) =>
      columns.map((column) =>
        csvCell(column.exportValue ? column.exportValue(row) : getColumnValue(column, row)),
      ),
    );
    const csv = [header, ...dataRows].map((row) => row.join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFilename;
    anchor.click();
    URL.revokeObjectURL(url);
      toast.success("CSV report exported successfully.");
    } catch {
      toast.error("Unable to export the CSV report.");
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: analyticsColors.neutral.border,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {(title || filterable || exportable) && (
        <Toolbar sx={{ gap: 2, justifyContent: "space-between", flexWrap: "wrap", px: 2 }}>
          {title && (
            <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
            {filterable && (
              <TextField
                size="small"
                value={filter}
                placeholder={filterPlaceholder}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setPage(0);
                }}
                slotProps={{ htmlInput: { "aria-label": filterPlaceholder } }}
              />
            )}
            {exportable && (
              <Button size="small" variant="outlined" onClick={exportCsv}>
                Export CSV
              </Button>
            )}
          </Box>
        </Toolbar>
      )}
      <TableContainer sx={{ maxHeight: 640 }}>
        <Table stickyHeader size="small" aria-label={typeof title === "string" ? title : "Analytics data"}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align ?? "left"}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                  sx={{
                    backgroundColor: analyticsColors.neutral.surface,
                    color: analyticsColors.neutral.text,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.sortable === false ? (
                    column.header
                  ) : (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : "asc"}
                      onClick={() => toggleSort(column)}
                    >
                      {column.header}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, index) => (
                <TableRow
                  hover
                  key={getRowId ? getRowId(row, index) : index}
                  sx={{
                    "&:nth-of-type(even)": { backgroundColor: "action.hover" },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align ?? "left"}>
                      {column.render ? column.render(row) : String(getColumnValue(column, row) ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={(_event, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
      />
    </Paper>
  );
}

export default AnalyticsTable;
