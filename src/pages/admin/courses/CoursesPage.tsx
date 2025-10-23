"use client"

import { useState } from 'react'
import { useCourses, useDeleteCourse } from '@/hooks/useCourses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Archive, Edit, PlusCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tables } from '@/integrations/supabase/types'

type Course = Tables<'courses'>

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses()
  const deleteCourse = useDeleteCourse()
  const [courseToArchive, setCourseToArchive] = useState<Course | null>(null)

  const handleArchive = () => {
    if (courseToArchive) {
      deleteCourse.mutate(courseToArchive.id, {
        onSuccess: () => setCourseToArchive(null),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Cursos</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Cursos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Curso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === 'ativo' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => setCourseToArchive(course)}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!courseToArchive} onOpenChange={() => setCourseToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Arquivamento</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja arquivar o curso{' '}
              <span className="font-semibold">{courseToArchive?.name}</span>?
              <br />
              Esta ação o removerá da visualização de todos os usuários. Os dados
              históricos serão mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCourse.isPending}
            >
              {deleteCourse.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sim, Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}