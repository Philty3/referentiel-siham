import { DataTable } from "@/components/DataTable";

const Reference3 = () => {
  const sampleData = [
    { reference: "REF-001", nom: "Item 1", valeur: "100" },
    { reference: "REF-002", nom: "Item 2", valeur: "200" },
  ];

  const columns = [
    { key: "reference", label: "Référence" },
    { key: "nom", label: "Nom" },
    { key: "valeur", label: "Valeur" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <DataTable
        title="Référentiel 3"
        description="Données du troisième référentiel SIHAM"
        data={sampleData}
        columns={columns}
      />
    </div>
  );
};

export default Reference3;
