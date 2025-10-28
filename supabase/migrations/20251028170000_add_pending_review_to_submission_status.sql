-- Add 'pending_review' to submission_status enum
ALTER TYPE treinamento.submission_status ADD VALUE IF NOT EXISTS 'pending_review';
