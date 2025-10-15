import { DataTable } from "@/components/DataTable";

const Reference1 = () => {
  const sampleData = [
    { code: "001", libelle: "Exemple 1", statut: "Actif" },
    { code: "002", libelle: "Exemple 2", statut: "Actif" },
    { code: "003", libelle: "Exemple 3", statut: "Inactif" },
  ];

  const columns = [
    { key: "code", label: "Code" },
    { key: "libelle", label: "Libellé" },
    { key: "statut", label: "Statut" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <DataTable
        title="Référentiel 1"
        description="Données du premier référentiel SIHAM"
        data={sampleData}
        columns={columns}
      />
    </div>
  );
};

export default Reference1;
