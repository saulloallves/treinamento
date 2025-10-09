import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseCoverUploadProps {
  currentCoverUrl?: string;
  onCoverChange: (url: string | null) => void;
  courseId?: string;
}

export const CourseCoverUpload: React.FC<CourseCoverUploadProps> = ({
  currentCoverUrl,
  onCoverChange,
  courseId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-covers')
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onCoverChange(publicUrl);

      toast({
        title: "Sucesso",
        description: "Capa do curso enviada com sucesso!",
      });

    } catch (error: any) {
      console.error('Error uploading cover:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar a capa do curso.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCover = async () => {
    if (currentCoverUrl && currentCoverUrl.includes('course-covers')) {
      try {
        // Extract file name from URL
        const fileName = currentCoverUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('course-covers')
            .remove([fileName]);
        }
      } catch (error) {
        console.error('Error removing cover:', error);
      }
    }

    setPreviewUrl(null);
    onCoverChange(null);
  };

  return (
    <div className="space-y-4">
      <Label>Capa do Curso</Label>
      
      {previewUrl ? (
        <div className="relative">
          <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border">
            <img 
              src={previewUrl} 
              alt="Capa do curso" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveCover}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Image className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Clique para adicionar uma capa ao curso
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG até 5MB • Recomendado: 1200x675px
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="cover-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Enviando...' : previewUrl ? 'Alterar Capa' : 'Adicionar Capa'}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveCover}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};