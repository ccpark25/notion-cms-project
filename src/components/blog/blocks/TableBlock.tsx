import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableBlockProps {
  block: NotionBlock;
}

// table 블록 렌더러 - shadcn Table 컴포넌트 재사용
export function TableBlock({ block }: TableBlockProps) {
  if (!block.table || !block.children) return null;

  const { has_column_header } = block.table;
  const rows = block.children.filter((child) => child.type === "table_row" && child.table_row);

  if (rows.length === 0) return null;

  const headerRow = has_column_header ? rows[0] : null;
  const bodyRows = has_column_header ? rows.slice(1) : rows;

  return (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <Table>
        {/* 헤더 행 */}
        {headerRow?.table_row && (
          <TableHeader>
            <TableRow>
              {headerRow.table_row.cells.map((cell, cellIndex) => (
                <TableHead key={cellIndex}>
                  <RichText richText={cell} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}

        {/* 데이터 행들 */}
        <TableBody>
          {bodyRows.map((row) => {
            if (!row.table_row) return null;
            return (
              <TableRow key={row.id}>
                {row.table_row.cells.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <RichText richText={cell} />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
