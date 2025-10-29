import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useAuth } from "@/hooks/useAuth";
import guiaAlunoMd from "../../docs/guia-aluno.md?raw";
import guiaProfessorMd from "../../docs/guia-professor.md?raw";
import guiaAdminMd from "../../docs/guia-admin.md?raw";

interface DocumentationDialogProps {
  variant?: "default" | "sidebar";
}

const DocumentationDialog = ({ variant = "default" }: DocumentationDialogProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: isProfessor } = useIsProfessor(user?.id);

  const convertMarkdownToHtml = (markdown: string) => {
    let html = markdown;

    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-5">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold mb-2 mt-3">$1</h4>');

    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>');

    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    html = html.replace(/```(.*?)```/gs, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>');

    html = html.replace(/^---$/gim, '<hr class="my-6 border-border" />');

    html = html.replace(/^(?!<[hl]|<p|<ul|<ol|<pre|<hr|<li)(.*$)/gim, '<p class="mb-3 leading-relaxed">$1</p>');

    return html;
  };

  const defaultTab = isAdmin ? "admin" : isProfessor ? "professor" : "aluno";

  const triggerButton = variant === "sidebar" ? (
    <button className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted text-foreground hover:text-foreground w-full">
      <div className="w-5 h-5 shrink-0">
        <BookOpen className="w-5 h-5" />
      </div>
      <span className="font-medium truncate">Aprenda a Usar o Sistema</span>
    </button>
  ) : (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <BookOpen className="h-4 w-4" />
      <span className="hidden md:inline">Aprenda a Usar o Sistema</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Documentação do Sistema
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3 gap-2">
            <TabsTrigger value="aluno">Guia do Aluno</TabsTrigger>
            {isProfessor && <TabsTrigger value="professor">Guia do Professor</TabsTrigger>}
            {isAdmin && <TabsTrigger value="admin">Guia do Administrador</TabsTrigger>}
          </TabsList>

          <ScrollArea className="flex-1 px-6 pb-6">
            <TabsContent value="aluno" className="mt-4">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(guiaAlunoMd) }}
              />
            </TabsContent>

            {isProfessor && (
              <TabsContent value="professor" className="mt-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(guiaProfessorMd) }}
                />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="admin" className="mt-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(guiaAdminMd) }}
                />
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentationDialog;
