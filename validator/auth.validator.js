import { z } from 'zod';

const loginSchema = z.object({
  login: z.string().min(6, "Login é obrigatório"),
  senha: z.string().min(8, "Senha é obrigatória"),
});

export { loginSchema };