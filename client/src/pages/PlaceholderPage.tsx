import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  icon: string;
  description: string;
  buttonText: string;
}

export default function PlaceholderPage({ title, icon, description, buttonText }: PlaceholderPageProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-12 text-center">
        <i className={`${icon} text-4xl text-slate-400 mb-4`}></i>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
