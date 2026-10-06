# Configurar login seguro do Marketing Contábil

Esta versão usa Supabase Auth + banco de dados. As senhas não ficam no HTML nem em localStorage.

## 1. Criar o projeto
1. Acesse https://supabase.com/ e crie um projeto.
2. Abra **SQL Editor**.
3. Cole o conteúdo de `supabase-schema.sql` e execute.

## 2. Pegar as chaves públicas
No Supabase, abra **Project Settings → API** e copie:
- Project URL
- Publishable key

Edite `supabase-config.js` e substitua:
- já configurada
- já configurada

Nunca coloque a `service_role` key no site.

## 3. Criar sua conta de administrador
1. Publique o site depois de configurar as chaves.
2. Clique em **Criar minha conta**.
3. Cadastre seu nome, seu e-mail e sua senha.
4. Se a confirmação de e-mail estiver habilitada no Supabase, confirme o e-mail.
5. No SQL Editor execute, trocando pelo seu e-mail:

```sql
update public.profiles
set role = 'admin', status = 'approved'
where email = 'SEU_EMAIL_AQUI';
```

6. Volte ao site e entre normalmente.

## 4. Como funciona
- Novos cadastros entram como **Pendente**.
- Usuários pendentes conseguem autenticar a senha, mas não entram no aplicativo.
- Na área **Usuários**, o administrador pode aprovar, bloquear ou rejeitar.
- Usuários bloqueados continuam sem acesso ao aplicativo.
- O papel `admin` e o status `approved` são necessários para acessar a administração.

## 5. Publicar no Netlify
Envie o conteúdo desta pasta para o seu site Netlify, substituindo a versão anterior.

## Observação importante
O Netlify continua hospedando a interface. O Supabase cuida da autenticação e do banco. Isso permite que várias pessoas usem a mesma conta online e que a aprovação seja centralizada.
