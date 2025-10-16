-- Inserir dados da tabela de certificados que foram perdidos na migração anterior

INSERT INTO treinamento.certificates (id, user_id, course_id, enrollment_id, certificate_url, generated_at, valid_until, status, turma_id) 
VALUES ('e3373711-7fa2-4389-8ffc-e843cc9997b6', '5b0e75b2-aef0-4ae8-a761-577314d607b3', 'f82446fb-5304-4100-afbb-2c25a54d06e1', '9c9d27ec-16f7-4373-a861-3d858291ae58', NULL, '2025-09-05 19:14:38.358399+00', NULL, 'active', 'c55a7cb1-8521-4f92-a1fd-3a655b1c2ac6')
ON CONFLICT (id) DO NOTHING;
