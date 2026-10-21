import { z } from 'zod';

export const driverGanhoSchema = z
  .object({
    veiculo_id: z.string().uuid('Selecione um veículo válido.'),
    plataforma_slug: z.string().min(1, 'Selecione a plataforma.'),
    data_trabalho: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado YYYY-MM-DD).'),
    especie_centavos: z.number().int().nonnegative('Valor em espécie não pode ser negativo.').default(0),
    app_centavos: z.number().int().nonnegative('Valor em app não pode ser negativo.').default(0),
    km_inicial: z.number().int().nonnegative('KM inicial inválido.').nullable().optional(),
    km_final: z.number().int().nonnegative('KM final inválido.').nullable().optional(),
    horas_trabalhadas: z.number().min(0).max(24, 'Máximo de 24 horas por turno.').nullable().optional(),
    corridas: z.number().int().nonnegative('O número de corridas deve ser zero ou positivo.').nullable().optional(),
  })
  .refine((data) => data.especie_centavos + data.app_centavos > 0, {
    message: 'O ganho total do turno deve ser superior a zero.',
    path: ['app_centavos'],
  })
  .refine(
    (data) => {
      if (data.km_inicial !== null && data.km_inicial !== undefined && data.km_final !== null && data.km_final !== undefined) {
        return data.km_final >= data.km_inicial;
      }
      return true;
    },
    {
      message: 'A quilometragem final não pode ser menor do que a quilometragem inicial.',
      path: ['km_final'],
    }
  );

export type DriverGanhoInput = z.infer<typeof driverGanhoSchema>;

export const driverDespesaSchema = z.object({
  veiculo_id: z.string().uuid('ID de veículo inválido.').nullable().optional(),
  categoria_id: z.string().uuid('Selecione uma categoria de despesa válida.'),
  descricao: z.string().trim().min(2, 'Descrição obrigatória (mínimo 2 caracteres).').max(100),
  valor_centavos: z.number().int().positive('O valor deve ser maior que zero.'),
  litros: z.number().positive('A quantidade de litros deve ser maior que zero.').nullable().optional(),
  km_no_registro: z.number().int().nonnegative('Quilometragem no registro inválida.').nullable().optional(),
  data_despesa: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado YYYY-MM-DD).'),
});

export type DriverDespesaInput = z.infer<typeof driverDespesaSchema>;