import React, { useState } from "react";
import { Button, TableCell, TableRow, TextField } from "@mui/material";
import AlgoliaTable from "@/components/Materials/Table";
import WithAuth from "@/components/Auth/WithAuth";
import { queryNeoUsersFunction } from "@/firebase/functions/users/queryNeoUsers";

type NeoJS = {
  elementId: string;
  displayName: string;
  photoURL: string;
};

export default function AminUsers() {
  const [users, setUsers] = useState<NeoJS[]>([]);
  const [query, setQuery] = useState("");

  const searchUsers = async () => {
    await queryNeoUsersFunction({ query }).then((result) => {
      setUsers(result.data);
    });
  };

  return (
    <WithAuth admin>
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      ></TextField>
      <Button
        onClick={() => {
          searchUsers();
        }}
      >
        Buscar
      </Button>
      <AlgoliaTable headers={["Nombre"]}>
        <>
          {users.map((user) => (
            <CustomHit item={user} key={user.elementId} />
          ))}
        </>
      </AlgoliaTable>
    </WithAuth>
  );
}

function CustomHit({ item }: { item: NeoJS }) {
  return (
    <TableRow key={item["elementId"]}>
      <TableCell>{item["displayName"]}</TableCell>
    </TableRow>
  );
}
