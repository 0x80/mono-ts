import React from "react";
import SearchBoxAlgolia from "@/services/algolia/InstantSearch";
import { TableCell, TableRow } from "@mui/material";
import AlgoliaTable from "@/components/Materials/Table";
import { useHits, type UseHitsProps } from "react-instantsearch";
import WithAuth from "@/components/Auth/WithAuth";
import { makeStyles } from "tss-react/mui";
import { useRouter } from "next/router";

const useStyles = makeStyles()((theme) => ({
  link: {
    color: theme.palette.primary.main,
    textDecoration: "underline",
    cursor: "pointer",
  },
}));

export default function AminUsers() {
  return (
    <WithAuth admin>
      <SearchBoxAlgolia
        index={process.env.NEXT_PUBLIC_ALGOLIA_USER_INDEX || ""}
      >
        <AlgoliaTable
          headers={["ID", "Email", "Nombre", "DNI", "Tipo DNI", "País"]}
        >
          <CustomHits />
        </AlgoliaTable>
      </SearchBoxAlgolia>
    </WithAuth>
  );
}

type Hit = {
  objectID: string;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  dniType: string;
  country: string;
};

function CustomHits(props: UseHitsProps<Hit>) {
  const { classes } = useStyles();

  const { hits } = useHits(props);
  const router = useRouter();

  return hits.map((hit: Hit) => {
    return (
      <TableRow key={hit["objectID"]}>
        <TableCell>{hit["objectID"]}</TableCell>
        <TableCell>
          <a
            className={classes.link}
            onClick={() => {
              router.push("/admin/users/" + hit["objectID"]);
            }}
          >
            {hit["email"]}
          </a>
        </TableCell>
        <TableCell>
          {hit["firstName"]} {hit["lastName"]}
        </TableCell>
        <TableCell>{hit["dni"]}</TableCell>
        <TableCell>{hit["dniType"]}</TableCell>
        <TableCell>{hit["country"]}</TableCell>
      </TableRow>
    );
  });
}
