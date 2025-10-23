import { supabase, supabasePublic } from './client';
import type { Database } from './types';

// Helper para operações no schema treinamento
export const treinamento = {
  // Tabelas de usuários e autenticação
  users: () => supabase.from('users'),
  admin_users: () => supabase.from('admin_users'),
  
  // Tabelas do sistema de treinamento
  courses: () => supabase.from('courses'),
  lessons: () => supabase.from('lessons'),
  modules: () => supabase.from('modules'),
  turmas: () => supabase.from('turmas'),
  enrollments: () => supabase.from('enrollments'),
  attendance: () => supabase.from('attendance'),
  
  // Tabelas de progresso e avaliação
  lesson_progress: () => supabase.from('lesson_progress'),
  quiz: () => supabase.from('quiz'),
  quiz_attempts: () => supabase.from('quiz_attempts'),
  quiz_responses: () => supabase.from('quiz_responses'),
  evaluations: () => supabase.from('evaluations'),
  evaluation_responses: () => supabase.from('evaluation_responses'),
  
  // Tabelas de certificados e testes
  certificates: () => supabase.from('certificates'),
  tests: () => supabase.from('tests'),
  test_attempts: () => supabase.from('test_attempts'),
  test_responses: () => supabase.from('test_responses'),
  
  // Tabelas de configuração
  collaboration_requests: () => supabase.from('collaboration_requests'),
  collaboration_approvals: () => supabase.from('collaboration_approvals'),
  lesson_dispatches: () => supabase.from('lesson_dispatches'),
  whatsapp_messages: () => supabase.from('whatsapp_messages'),
  
  // Tabelas de relatórios
  turma_reports: () => supabase.from('turma_reports'),
  
  // Views
  lesson_completion_stats: () => supabase.from('lesson_completion_stats'),
  turma_completion_stats: () => supabase.from('turma_completion_stats'),
  user_course_progress: () => supabase.from('user_course_progress'),
};

// Helper para operações no schema public (Matriz)
export const matriz = {
  // Tabelas da estrutura organizacional
  unidades: () => supabasePublic.from('unidades'),
  colaboradores_loja: () => supabasePublic.from('colaboradores_loja'),
  cargos_loja: () => supabasePublic.from('cargos_loja'),
  
  // Tabelas de clientes e vendas
  clientes: () => supabasePublic.from('clientes'),
  orcamentos: () => supabasePublic.from('orcamentos'),
  vendas: () => supabasePublic.from('vendas'),
  
  // Outras tabelas do schema public conforme necessário
};

// Helper para operações de autenticação (sempre usa o cliente principal)
export const auth = supabase.auth;

// Helper para storage
export const storage = supabase.storage;

// Helper para funções RPC (sempre usa o cliente principal)
export const rpc = supabase.rpc;

// Tipos para clientes específicos
export type SupabaseClientTreinamento = typeof supabase;
export type SupabaseClientPublic = typeof supabasePublic;