import { z } from 'zod';

export const formaPagamentoEnum = z.enum([
  'pix',
  'dinheiro',
  'debito',
  'credito',
  'boleto',
  'transferencia',
]);

export const tipoTransacaoEnum = z.enum(['despesa', 'receita']);
export const statusTransacaoEnum = z.enum(['pendente', 'pago']);

export const transacaoSchema = z
  .object({
    descricao: z
      .string()
      .trim()
      .min(1, 'A descrição é obrigatória.')
      .max(120, 'A descrição deve ter no máximo 120 caracteres.'),
    valor_centavos: z
      .number()
      .int('O valor deve ser um número inteiro em cêntimos.')
      .positive('O valor deve ser estritamente maior que zero.'),
    tipo: tipoTransacaoEnum,
    data_competencia: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado YYYY-MM-DD).'),
    data_pagamento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado YYYY-MM-DD).')
      .nullable()
      .optional(),
    status: statusTransacaoEnum.default('pendente'),
    forma: formaPagamentoEnum,
    conta_id: z.string().uuid('ID de conta inválido.').nullable().optional(),
    cartao_id: z.string().uuid('ID de cartão inválido.').nullable().optional(),
    categoria_id: z.string().uuid('ID de categoria inválido.').nullable().optional(),
    parcelas: z.number().int().min(1).max(72).default(1),
    recorrente: z.boolean().default(false),
    observacao: z.string().max(500, 'A observação deve ter no máximo 500 caracteres.').nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.forma === 'credito') {
        return !!data.cartao_id;
      }
      return true;
    },
    {
      message: 'O cartão de crédito é obrigatório quando a forma de pagamento for crédito.',
      path: ['cartao_id'],
    }
  )
  .refine(
    (data) => {
      if (data.status === 'pago') {
        return !!data.data_pagamento;
      }
      return true;
    },
    {
      message: 'A data de pagamento é obrigatória para lançamentos já pagos.',
      path: ['data_pagamento'],
    }
  );

export type TransacaoInput = z.infer<typeof transacaoSchema>;