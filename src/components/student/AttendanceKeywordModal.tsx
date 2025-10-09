import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, KeyRound, AlertCircle } from 'lucide-react';

interface AttendanceKeywordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (keyword: string) => void;
  isSubmitting: boolean;
  lessonTitle: string;
  error?: string;
}

const AttendanceKeywordModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isSubmitting,
  lessonTitle,
  error 
}: AttendanceKeywordModalProps) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = () => {
    if (keyword.trim().length >= 3) {
      onSubmit(keyword.trim());
    }
  };

  const handleClose = () => {
    setKeyword('');
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyword.trim().length >= 3) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Confirmar Presença
          </DialogTitle>
          <DialogDescription>
            Para marcar sua presença na aula <strong>"{lessonTitle}"</strong>, 
            digite a palavra-chave mencionada pelo professor durante a aula.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="keyword">Palavra-chave da Aula</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite a palavra-chave..."
              disabled={isSubmitting}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              A palavra-chave deve ter pelo menos 3 caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={keyword.trim().length < 3 || isSubmitting}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Confirmando...' : 'Confirmar Presença'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceKeywordModal;