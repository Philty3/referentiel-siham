import { FileSpreadsheet, Database, Search, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: Database,
      title: "Référentiels Centralisés",
      description: "Accédez à tous vos référentiels SIHAM en un seul endroit",
    },
    {
      icon: Search,
      title: "Recherche Rapide",
      description: "Trouvez rapidement les données dont vous avez besoin",
    },
    {
      icon: FileText,
      title: "Données Structurées",
      description: "Consultez vos données organisées de manière claire et professionnelle",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
            <FileSpreadsheet className="h-16 w-16 text-primary" />
          </div>
          <h1 className="mb-4 text-5xl font-bold text-foreground">
            Référentiel SIHAM
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Plateforme de consultation des référentiels principaux SIHAM.
            Accédez facilement à vos données de référence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 p-6 transition-all hover:border-primary hover:shadow-lg"
            >
              <feature.icon className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-lg bg-gradient-to-r from-primary to-accent p-8 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Prêt à explorer vos référentiels ?</h2>
          <p className="mb-6 text-lg opacity-90">
            Utilisez le menu de navigation ci-dessus pour accéder aux différents référentiels
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
