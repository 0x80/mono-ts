import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import MUIDataTable from "mui-datatables";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import { useAuthContext } from "@/context/AuthContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import Image from "next/image";
import { streamBlogs } from "@/firebase/db/blogs";
import type { BlogWithId } from "@/firebase/interfaces/blogs";

const useStyles = makeStyles()((_) => ({
  tableContainer: {
    width: "100%",
    background: "#fff",
    borderRadius: "8px",
    marginBottom: "64px",
  },

  eventTitle: {
    fontWeight: "bold",
  },
}));

export default function AdminBlogs() {
  const { classes } = useStyles();
  const { isAdmin } = useAuthContext();
  const [rows, setRows] = useState<BlogWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = streamBlogs(
      (snapshot) => {
        const rows = snapshot.docs.map((doc) => {
          const blog = doc.data() as BlogWithId;
          return {
            ...blog,
            id: doc.id,
          };
        });
        setRows(rows);
        setLoading(false);
      },
      () => {
        return;
      }
    );
    return () => unsubscribe();
  }, []);

  const columns = [
    {
      name: "id",
      label: "ID",
      width: 90,
      options: { filter: false, sort: false },
    },
    {
      name: "headerImage",
      label: "Imagen",
      width: 90,
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_: string, tableMeta: { rowIndex: number }) => {
          const event = rows[tableMeta.rowIndex] ?? { headerImage: "" };
          return (
            <Image
              src={event.headerImage}
              alt={event.headerImage}
              style={{ width: "200px", height: "100px", borderRadius: "8px" }}
              height={100}
              width={100}
            />
          );
        },
      },
    },
    {
      name: "title",
      label: "Título",
      width: 100,
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "authorName",
      label: "Autor",
      width: 100,
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value: string) => value,
      },
    },
    {
      name: "clicked",
      label: "Clicks",
      width: 100,
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value: string) => (
          <div className={classes.eventTitle}>{value ?? 0}</div>
        ),
      },
    },
  ];

  if (!isAdmin) return <Unauthorized />;

  return (
    <Box className={classes.tableContainer}>
      {loading ? (
        <LoadingComponent />
      ) : (
        <MUIDataTable
          title={"Blogs"}
          data={rows}
          columns={columns}
          options={{
            filterType: "dropdown",
            responsive: "vertical",
            selectableRows: "none",
            print: false,
            download: false,
            viewColumns: false,
          }}
        />
      )}
    </Box>
  );
}
