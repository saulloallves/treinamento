-- Assign the current professor to existing turmas to show real data in the dashboard
UPDATE turmas 
SET responsavel_user_id = '5b0e75b2-aef0-4ae8-a761-577314d607b3'
WHERE id IN (
    'c55a7cb1-8521-4f92-a1fd-3a655b1c2ac6',
    'f674b53f-5aaa-4b1c-b71d-1c1f9f622b4b', 
    '663d1a07-969c-46b5-aa15-8d1c6eaf026a',
    'b3ddf8ce-09a0-4e41-bfd3-53c258afe710'
);