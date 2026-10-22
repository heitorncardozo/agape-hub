# Ágape Hub

## Configuração

1. Crie um projeto no Supabase e configure `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` no arquivo `.env` (use `.env.example` como referência).
2. No SQL Editor do projeto, execute `supabase/schema.sql` e
   `supabase/fix-profiles-rls.sql`.
3. Execute `supabase/persisted-app-data.sql` para criar a tabela e as políticas que
   armazenam encontros, eventos, financeiro, documentos, presenças e dados dos retiros.
4. Cadastre o perfil do usuário autenticado em `public.profiles`. Para o primeiro
   coordenador, use `supabase/seed-creator.sql` substituindo `<UID_DO_USUARIO>` pelo
   UUID da conta em Supabase Authentication. As regras do banco só permitem leitura
   e escrita de acordo com o perfil ativo autenticado.
5. Execute `npm install` e `npm run dev`.

Os registros das telas são armazenados no Supabase. Membros usam a tabela
`public.members`; as demais coleções usam `public.app_records`. Registros que haviam
sido salvos no armazenamento local anterior são migrados para o Supabase quando a
coleção correspondente ainda não possui dados no banco.

Uploads de arquivos e criação de contas reais pela tela de administração ainda não
fazem parte desta versão; documentos e usuários dessa tela são apenas metadados.
