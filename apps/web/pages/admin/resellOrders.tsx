import React, { useEffect, useState } from "react";
import WithAuth from "@/components/Auth/WithAuth";
import type { ResellOrder } from "@/firebase/interfaces/events/resellOrders";

import {
  streamApprovedResellOrders,
  updateStatusResellOrder,
} from "@/firebase/db/events/resellOrders";
import MUIDataTable, { type MUIDataTableMeta } from "mui-datatables";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import StatusLabel from "@/components/Event/Operations/StatusLabel";
import LoadingButton from "@/components/Materials/LoadingButton";

type ResellRow = {
  id: string;
  status: string;
  createdAt: string;
  hoursLeft: number;
  eventName: string;
  amount: number;
  userName: string;
  userDni: string;
  userMail: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  eventId: string;
  digitVerificator: string;
  paymentType: string;
};

const BANK_CODES = {
  "Banco de Chile / A. Edwards / Citibank N.A.": "001",
  "Banco Internacional": "009",
  "Dresdner Bank Leteinamerika": "011",
  "Banco del Estado de Chile": "012",
  Scotiabank: "014",
  "Banco Crédito e Inversiones": "016",
  "Banco Do Brasil S.A.": "017",
  Corpbanca: "027",
  "Banco Bice": "028",
  "HSBC Bank Chile": "031",
  "Banco Santander - Santiago": "037",
  "Banco Itaú": "039",
  "JP Morgan Chase Bank": "041",
  "Banco de la Nación Argentina": "043",
  "The Bank of Tokyo – Mitsubishi": "045",
  "Abn Amro Bank (Chile)": "046",
  "Banco Security": "049",
  "Banco Falabella": "051",
  "Deutsche Bank (Chile)": "052",
  "Banco Ripley": "053",
  "HNS Banco": "054",
  "Banco Consorcio": "055",
  "BBVA Banco Bhif": "504",
  "Banco del Desarrollo": "507",
  "Banco Conosur": "734",
  Copeeuch: "672",
  "Tarjetas Los Heroes S.A.": "729",
  "Tenpo Prepago S.A.": "730",
  "Los Andes Tarjetas de Prepago": "732",
  "Cuentas Mach": "116",
};

export default function AdminResellOrders() {
  const [rows, setRows] = useState<ResellRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = streamApprovedResellOrders(
      (snapshot) => {
        const rows: ResellRow[] = snapshot.docs.map((doc) => {
          const resellOrder = doc.data() as ResellOrder;
          return {
            chargeAccount: "89892151".padStart(12, "0"),
            id: doc.id,
            status: resellOrder.status,
            createdAt: resellOrder.createdAt.toDate().toLocaleString(),
            hoursLeft: Math.floor(
              (new Date().getTime() -
                resellOrder.createdAt.toDate().getTime()) /
                (1000 * 60 * 60)
            ),
            eventName: resellOrder.eventName,
            amount: resellOrder.total,
            userName: resellOrder.bankAccountName,
            userDni: resellOrder.bankAccountDni
              .replace(".", "")
              .replace("-", "")
              .slice(0, -1),
            userMail: resellOrder.bankAccountEmail,
            bankName: resellOrder.bankName,
            bankCode:
              BANK_CODES[resellOrder.bankName as keyof typeof BANK_CODES],
            bankAccountType: resellOrder.bankAccountType,
            bankAccountNumber: resellOrder.bankAccountNumber.padStart(18, "0"),
            eventId: resellOrder.eventId,
            digitVerificator: resellOrder.bankAccountDni
              .replace(".", "")
              .replace("-", "")
              .slice(-1),
            paymentType: "OTR",
            paymentMessage:
              "Transferencia de reventa para " + resellOrder.eventName,
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
      options: { filter: false, sort: false, download: false },
    },
    {
      name: "status",
      label: "Estado",
      options: {
        filter: true,
        sort: true,
        download: false,
        customBodyRender: (value: string) => <StatusLabel status={value} />,
      },
    },
    {
      name: "chargeAccount",
      label: "Nº Cuenta de Cargo",
      width: 90,
      options: { filter: false, sort: false, display: false },
    },
    {
      name: "bankAccountNumber",
      label: "Nº Cuenta de Destino",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "bankCode",
      label: "Banco Destino",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "userDni",
      label: "Rut Beneficiario",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "digitVerificator",
      label: "Dig. Verif. Beneficiario",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "userName",
      label: "Nombre Beneficiario",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "bankName",
      label: "Banco",
      options: {
        filter: true,
        sort: true,
        download: false,
      },
    },
    {
      name: "bankAccountType",
      label: "Tipo de cuenta",
      options: {
        filter: true,
        sort: true,
        download: false,
      },
    },
    {
      name: "userMail",
      label: "Correo",
      options: {
        filter: false,
        sort: true,
        download: false,
      },
    },
    {
      name: "amount",
      label: "Monto Transferencia",
      options: {
        filter: false,
        sort: true,
      },
    },

    {
      name: "-",
      label: "Nro.Factura Boleta (1)",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "-",
      label: "Nº Orden de Compra(1)",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "paymentType",
      label: "Tipo de Pago(2)",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "paymentMessage",
      label: "Mensaje Destinatario (3)",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "userMail",
      label: "Email Destinatario(3)",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "userName",
      label: "Cuenta Destino inscrita como(4)",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },

    {
      name: "createdAt",
      label: "Fecha",
      options: {
        filter: false,
        sort: true,
        download: false,
      },
    },
    {
      name: "hoursLeft",
      label: "Horas transcurridas",
      options: {
        filter: false,
        sort: true,
        download: false,
      },
    },
    {
      name: "eventName",
      label: "Evento",
      options: {
        filter: false,
        sort: true,
        download: false,
      },
    },

    {
      name: "status",
      label: "Estado",
      options: {
        filter: false,
        sort: false,
        download: false,
        customBodyRender: (_: unknown, tableMeta: MUIDataTableMeta) => {
          const order: ResellRow = rows[tableMeta.rowIndex]!;
          return order.status !== "Transferred" ? (
            <LoadingButton
              variant="contained"
              color="secondary"
              onClick={() =>
                void updateStatusResellOrder(
                  order.eventId,
                  order.id,
                  "Transferred",
                  1
                )
              }
            >
              Marcar como transferido
            </LoadingButton>
          ) : (
            <LoadingButton
              variant="contained"
              onClick={() =>
                void updateStatusResellOrder(
                  order.eventId,
                  order.id,
                  "Rejected",
                  3
                )
              }
            >
              Cancelar
            </LoadingButton>
          );
        },
      },
    },
  ];

  return (
    <div>
      <WithAuth admin>
        {loading ? (
          <LoadingComponent />
        ) : (
          <MUIDataTable
            title={"Ordenes de reventa"}
            data={rows}
            columns={columns}
            options={{
              filterType: "dropdown",
              responsive: "vertical",
              selectableRows: "none",
              print: false,
              viewColumns: false,
              downloadOptions: {
                filename: "nomina_reventa.txt",
                separator: ";",
              },
              setRowProps: () => ({
                style: { cursor: "pointer" },
              }),
              onDownload: (buildHead, buildBody, columns, data) => {
                // Build the CSV content without quotation marks
                const statusIndex = columns.findIndex(
                  (column: { name: string }) => column.name === "status"
                );
                const filterApproved = (row: { data: string[] }) =>
                  row.data[statusIndex] === "Approved";
                const filteredData = data.filter(filterApproved);
                const csv = `${buildHead(columns)}${buildBody(filteredData)}`;
                return csv.replace(/"/g, ""); // Remove quotation marks
              },
            }}
          />
        )}
      </WithAuth>
    </div>
  );
}
