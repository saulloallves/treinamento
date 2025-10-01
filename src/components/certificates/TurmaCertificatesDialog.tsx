import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Award, Calendar, User } from "lucide-react";

interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  generatedAt: string;
  status: string;
  url: string | null;
}

interface TurmaCertificatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaName: string;
  professorName: string;
  certificates: Certificate[];
}

const TurmaCertificatesDialog = ({
  open,
  onOpenChange,
  turmaName,
  professorName,
  certificates
}: TurmaCertificatesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{turmaName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Professor: {professorName}
          </p>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Aluno</TableHead>
                <TableHead className="min-w-[180px]">Curso</TableHead>
                <TableHead className="w-[120px]">Data da Emissão</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="font-medium truncate">{cert.studentName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{cert.courseName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">
                        {cert.generatedAt ? new Date(cert.generatedAt).toLocaleDateString('pt-BR') : '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      String(cert.status).toLowerCase() === 'emitido' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {cert.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {cert.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cert.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TurmaCertificatesDialog;
