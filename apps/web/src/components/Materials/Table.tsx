import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box"; // Import Box for styling

type AlgoliaTableProps = {
  children: JSX.Element;
  headers: string[];
  loading?: boolean; // Optional loading state
  className?: string; // Optional class for custom styles
};

export default function AlgoliaTable({
  children,
  headers,
  loading = false, // Default to false
  className,
}: AlgoliaTableProps) {
  return (
    <Box
      sx={{
        boxShadow: 3, // Shadow effect
        borderRadius: 2, // Rounded corners
        overflow: "hidden", // To ensure rounded corners work
        backgroundColor: "white", // Background color
      }}
      className={className}
    >
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={headers.length} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
