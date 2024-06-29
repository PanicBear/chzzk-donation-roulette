import _ from "lodash";

type Row = Record<string, unknown>;

interface ExportToCSVParams {
  filename?: string;
  filter: Record<string, boolean>;
  rows: Row[];
}

export default function exportToCSV({
  filename = Date.now().toString(),
  filter,
  rows,
}: ExportToCSVParams) {
  const csvFile = _.reduce(
    rows,
    (prev, next) => {
      const filteredRow = Object.entries(next).reduce<unknown[]>(
        (prev, next) => {
          let [key, value] = next;

          if (typeof value === "object") value = "invalid";

          return filter[key] !== false ? [...prev, value] : [...prev];
        },
        []
      );

      return prev + filteredRow + "\n";
    },

    Object.keys(rows[0]).filter((key) => filter[key] !== false) + "\n"
  );

  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
