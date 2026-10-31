import { DefaultHomeActions, StatusPage } from "@/components/system/StatusPage";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="This page doesn’t exist or may have been moved. Check the link or head back into the staff console."
      icon={<FileQuestion className="h-6 w-6" />}
      actions={<DefaultHomeActions />}
    />
  );
}
