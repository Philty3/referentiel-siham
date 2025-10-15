import { DataTable } from "@/components/DataTable";

const Reference4 = () => {
  const sampleData = [
    { clef: "KEY1", designation: "Désignation 1", etat: "Validé" },
    { clef: "KEY2", designation: "Désignation 2", etat: "En cours" },
  ];

  const columns = [
    { key: "clef", label: "Clef" },
    { key: "designation", label: "Désignation" },
    { key: "etat", label: "État" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <DataTable
        title="Référentiel 4"
        description="Données du quatrième référentiel SIHAM"
        data={sampleData}
        columns={columns}
      />
    </div>
  );
};

export default Reference4;
