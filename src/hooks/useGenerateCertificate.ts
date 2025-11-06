import gerarCertificadoCresciPerdi from "@/lib/certificateGenerator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabasePublic } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerateCertificateVariables {
  enrollmentId: string;
  userId: string;
  courseId: string;
  studentName: string;
  courseName: string;
  completedLessons: string[];
}

export const useGenerateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: GenerateCertificateVariables) => {
      const { enrollmentId, userId, courseId, studentName, courseName, completedLessons } = variables;

      // 1. Criar o registro do certificado para obter um ID único
      const generatedAt = new Date();
      const { data: newCertificate, error: insertError } = await supabase
        .from('certificates')
        .insert({
          enrollment_id: enrollmentId,
          user_id: userId,
          course_id: courseId,
          turma_id: (await supabase.from('enrollments').select('turma_id').eq('id', enrollmentId).single()).data?.turma_id,
          generated_at: generatedAt.toISOString(),
          status: 'Emitido',
        })
        .select('id')
        .single();

      if (insertError) throw new Error(`Erro ao criar registro do certificado: ${insertError.message}`);
      
      const certificateId = newCertificate.id;
      const fileName = `Certificado_${studentName.replace(/ /g, '_')}_${certificateId}.pdf`;

      // 2. Construir a URL pública LONGA do arquivo no Supabase Storage
      const projectRef = "yhjwdoiaafaajhlsxoyt";
      const longUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/certificados/${fileName}`;
      
      // 3. Criar nosso próprio slug curto e salvá-lo no banco de dados
      const slug = Math.random().toString(36).substring(2, 8);
      const { error: slugError } = await supabasePublic
        .from('redirects')
        .insert({ slug, long_url: longUrl });

      if (slugError) {
        console.error("Erro ao salvar o slug de redirecionamento:", slugError);
        throw new Error("Falha ao criar o link curto para o certificado.");
      }

      // 4. Construir a URL curta usando nossa própria Edge Function de redirecionamento
      const shortUrl = `https://${projectRef}.supabase.co/functions/v1/redirect_encurtador/${slug}`;
      console.log(`URL longa original: ${longUrl}`);
      console.log(`URL curta para QR Code: ${shortUrl}`);

      // 5. Gerar o PDF como um Blob, incluindo a NOSSA URL CURTA no QR Code
      const pdfBlob = await gerarCertificadoCresciPerdi({
        nome: studentName,
        curso: courseName,
        data: generatedAt.toLocaleDateString('pt-BR'),
        cargaHoraria: await calculateCourseHours(completedLessons),
        certificadoUrl: shortUrl,
      });

      // 6. Fazer o upload do Blob para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, pdfBlob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw new Error(`Erro ao fazer upload do certificado: ${uploadError.message}`);

      // 7. Atualizar o registro do certificado com a URL pública LONGA
      const { error: updateError } = await supabase
        .from('certificates')
        .update({ certificate_url: longUrl })
        .eq('id', certificateId);

      if (updateError) console.warn("Falha ao salvar a URL do certificado no banco:", updateError.message);

      // 8. Forçar o download do Blob no navegador do administrador
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { ...variables, certificateUrl: longUrl };
    },
    onSuccess: () => {
      toast.success("Certificado gerado, salvo e baixado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'eligible-for-certs'] });
    },
    onError: (error: Error) => {
      toast.error("Falha ao gerar certificado", {
        description: error.message,
      });
    },
  });
};

// Função auxiliar para calcular a carga horária
async function calculateCourseHours(completedLessons: string[]): Promise<string> {
  if (completedLessons.length === 0) return "0h";

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('duration')
    .in('id', completedLessons);

  if (lessonsError) throw new Error(`Erro ao buscar aulas para cálculo de horas: ${lessonsError.message}`);
  
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  return `${Math.round(totalDuration / 60)}h`;
}