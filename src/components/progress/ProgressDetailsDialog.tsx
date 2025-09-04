import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap, Users, TrendingUp, Mail, User } from "lucide-react";

interface ProgressGroup {
  id: string;
  name: string;
  turmaName: string;
  courseName: string;
  items: any[];
}

interface ProgressDetailsDialogProps {
  group: ProgressGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Ativo':
      return <Badge variant="default">Ativo</Badge>;
    case 'Inativo':
      return <Badge variant="secondary">Inativo</Badge>;
    case 'Concluído':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const ProgressDetailsDialog = ({ group, open, onOpenChange }: ProgressDetailsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProgress = group.items.filter((student) =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgProgress = group.items.length > 0 
    ? Math.round(group.items.reduce((sum, item) => sum + (item.progress_percentage || 0), 0) / group.items.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            {group.courseName} - {group.turmaName}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{group.items.length} estudantes</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Progresso médio: {avgProgress}%</span>
            </div>
          </div>
          
          {/* Average Progress Bar */}
          <div className="mt-2">
            <Progress value={avgProgress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {filteredProgress.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum estudante encontrado para a busca." : "Nenhum estudante encontrado."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProgress.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{student.student_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{student.student_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student.status)}
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <Progress value={student.progress_percentage ?? 0} className="w-32" />
                          <span className="text-sm text-muted-foreground font-medium">
                            {student.progress_percentage ?? 0}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};