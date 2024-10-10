import type { FsTimestamp } from "@repo/common";
import { isDefined } from "@repo/common";
import { Timestamp } from "firebase/firestore";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";

type FsValue = string | number | boolean | null | FsTimestamp;

export default function KeyValueList(props: {
  data: Record<string, FsValue>;
  labels: Array<[string, string]>;
}) {
  const rows = props.labels.map(([key, label]) => (
    <TableRow className="bg-white" key={key}>
      <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
        {label}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-gray-500">
        {fsValueToString(props.data[key])}
      </TableCell>
    </TableRow>
  ));

  return (
    <Table className="divide-y divide-gray-200">
      <TableBody>{rows}</TableBody>
    </Table>
  );
}

function fsValueToString(value?: FsValue) {
  if (!isDefined(value)) {
    return "(undefined)";
  }

  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString();
  }

  if (value === null) {
    return "null";
  }

  return value.toString();
}
