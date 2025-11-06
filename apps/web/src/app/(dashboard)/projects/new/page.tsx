import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewProjectForm } from "@/components/dashboard/new-project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-white/10 bg-gray-950/80">
        <CardHeader>
          <CardTitle className="text-white">Create a new project</CardTitle>
        </CardHeader>
        <CardContent>
          <NewProjectForm />
        </CardContent>
      </Card>
    </div>
  );
}
