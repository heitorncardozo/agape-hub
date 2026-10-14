-- Seed inicial do usuário criador/coordenador geral
-- Troque o user_id abaixo pelo UID real do usuário criado no Authentication do Supabase.
-- Exemplo:
-- INSERT INTO public.profiles (user_id, email, name, role, is_creator, is_active)
-- VALUES ('<UID_DO_USUARIO>', 'raquel@agape.com', 'Raquel', 'coordenacao', true, true);

INSERT INTO public.profiles (user_id, email, name, role, is_creator, is_active)
VALUES (
  '<UID_DO_USUARIO>',
  'raquel@agape.com',
  'Raquel',
  'coordenacao',
  true,
  true
)
on conflict (user_id) do update
set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role,
  is_creator = true,
  is_active = true;
