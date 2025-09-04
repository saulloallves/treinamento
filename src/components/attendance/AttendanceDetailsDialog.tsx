import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap, Users, KeyRound } from "lucide-react";

interface AttendanceGroup {
  id: string;
  name: string;
  turmaName: string;
  courseName: string;
  items: any[];
}

interface AttendanceDetailsDialogProps {
  group: AttendanceGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AttendanceDetailsDialog = ({ group, open, onOpenChange }: AttendanceDetailsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttendances = group.items.filter((attendance) =>
    attendance.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.lesson.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <span>{group.items.length} {group.items.length === 1 ? 'presença confirmada' : 'presenças confirmadas'}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por aluno ou aula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {filteredAttendances.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhuma presença encontrada para a busca." : "Nenhuma presença confirmada para esta turma."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Aula</TableHead>
                    <TableHead>Palavra-chave</TableHead>
                    <TableHead>Confirmado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell className="font-medium">
                        {attendance.student}
                      </TableCell>
                      <TableCell>
                        {attendance.lesson}
                      </TableCell>
                      <TableCell>
                        {attendance.typedKeyword ? (
                          <div className="flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              {attendance.typedKeyword}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(attendance.confirmedAt).toLocaleString('pt-BR')}
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