import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

type RowType = {
  id: string;
};

export default function DataGridTable({
  rows,
  columns,
}: {
  rows: RowType[];
  columns: GridColDef<(typeof rows)[number]>[];
}) {
  return (
    <Box sx={{ height: 624, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
