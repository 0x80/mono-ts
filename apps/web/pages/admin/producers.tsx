import { useRouter } from "next/router";
import React from "react";
import SearchBoxAlgolia from "@/services/algolia/InstantSearch";
import { TableCell, TableRow } from "@mui/material";
import AlgoliaTable from "@/components/Materials/Table";
import { useHits, type UseHitsProps } from "react-instantsearch";
import { makeStyles } from "tss-react/mui";
import WithAuth from "@/components/Auth/WithAuth";
import LoadingButton from "@/components/Materials/LoadingButton";

const useStyles = makeStyles()(() => ({
  button: {
    marginBottom: "20px",
    width: "200px",
  },
}));

export default function AdminProducers() {
  const router = useRouter();
  const { classes } = useStyles();
  return (
    <WithAuth admin>
      <LoadingButton
        className={classes.button}
        variant="contained"
        color="secondary"
        onClick={() => {
          router.push("/producers/create");
        }}
      >
        Agregar Productora
      </LoadingButton>

      <SearchBoxAlgolia
        index={process.env.NEXT_PUBLIC_ALGOLIA_PRODUCER_INDEX || ""}
      >
        <AlgoliaTable headers={["ID", "Nombre", "", ""]}>
          <CustomHits />
        </AlgoliaTable>
      </SearchBoxAlgolia>
    </WithAuth>
  );
}

type Hit = {
  objectID: string;
  name: string;
};

function CustomHits(props: UseHitsProps<Hit>) {
  const router = useRouter();
  const { hits } = useHits(props);

  return hits.map((hit: Hit) => {
    return (
      <TableRow key={hit["objectID"]}>
        <TableCell>{hit["objectID"]}</TableCell>
        <TableCell>{hit["name"]}</TableCell>
        <TableCell>
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={() => {
              router.push(`/producers/${hit["objectID"]}/edit`);
            }}
          >
            Editar
          </LoadingButton>
        </TableCell>
        <TableCell>
          <LoadingButton
            variant="contained"
            color="info"
            onClick={() => {
              router.push(`/producers/${hit["objectID"]}/access`);
            }}
          >
            Gestionar acceso
          </LoadingButton>
        </TableCell>
      </TableRow>
    );
  });
}
