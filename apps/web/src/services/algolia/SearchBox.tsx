import { debounce, TextField } from "@mui/material";
import React, { useMemo } from "react";
import { useSearchBox, type UseSearchBoxProps } from "react-instantsearch";

export default function CustomSearchBox(props: UseSearchBoxProps) {
  const { refine } = useSearchBox(props);

  const debouncedRefine = useMemo(
    () =>
      debounce((newQuery: string) => {
        refine(newQuery);
      }, 500),
    [refine]
  );

  return (
    <div>
      <TextField
        placeholder="Buscar"
        variant="outlined"
        onChange={(event) => {
          debouncedRefine(event.currentTarget.value);
        }}
        fullWidth
      ></TextField>
    </div>
  );
}
