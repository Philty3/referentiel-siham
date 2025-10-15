import { DataTable } from "@/components/DataTable";

const Reference2 = () => {
  const sampleData = [
    { id: "A1", description: "Description A1", categorie: "Type 1" },
    { id: "A2", description: "Description A2", categorie: "Type 2" },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "description", label: "Description" },
    { key: "categorie", label: "Catégorie" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <DataTable
        title="Référentiel 2"
        description="Données du deuxième référentiel SIHAM"
        data={sampleData}
        columns={columns}
      />
    </div>
  );
};

export default Reference2;
