import GradientButton from "@/components/Materials/GradientButton";
import { useCSVReader } from "react-papaparse";

export default function CSVUploader({
  onFileLoaded,
}: {
  onFileLoaded: (data: { [key: string]: string[] }) => void;
}) {
  const { CSVReader } = useCSVReader();

  const transformDataToColumns = (data: string[][]) => {
    const columns: { [key: string]: string[] } = {};
    if (data.length > 1) {
      const headers = data[0]?.map((header: string) => header.toLowerCase());
      for (let i = 1; i < data.length; i++) {
        const row = data[i] ?? [];
        headers?.forEach((header: string, index: number) => {
          if (!columns[header]) {
            columns[header] = [];
          }
          columns[header].push(row[index] ?? "");
        });
      }
    }
    return columns;
  };

  return (
    <CSVReader
      onUploadAccepted={(results: { data: string[][] }) => {
        const columnData = transformDataToColumns(results.data);
        onFileLoaded(columnData);
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
      }: any) => (
        <>
          <div
            {...getRootProps()}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            {acceptedFile
              ? acceptedFile.name
              : "Sube un csv con los correos, debe tener una columna llamada 'email'"}
          </div>
          <ProgressBar />
          {acceptedFile && (
            <GradientButton
              {...getRemoveFileProps({
                onClick: () => onFileLoaded({}),
              })}
              style={{ marginTop: "10px" }}
              variant="contained"
              color="error"
            >
              Eliminar
            </GradientButton>
          )}
        </>
      )}
    </CSVReader>
  );
}
