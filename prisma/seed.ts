/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/passwords';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@crm.dev';
  const password = 'Demo123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Demo user already exists - skipping seed.');
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: 'Usuário Demo',
      email,
      passwordHash,
      timezone: 'America/Sao_Paulo',
      pipelines: {
        create: {
          name: 'Funil Principal',
          isDefault: true,
          stages: {
            createMany: {
              data: [
                { name: 'Novos', position: 0, color: '#2563eb' },
                { name: 'Contato Feito', position: 1, color: '#0ea5e9' },
                { name: 'Qualificado', position: 2, color: '#22c55e' },
                { name: 'Fechado', position: 3, color: '#facc15' }
              ]
            }
          }
        }
      }
    },
    include: {
      pipelines: {
        include: {
          stages: true
        }
      }
    }
  });

  const pipeline = user.pipelines[0];
  const [firstStage, secondStage] = pipeline.stages;

  await prisma.lead.createMany({
    data: [
      {
        title: 'Contato via Landing Page',
        company: 'Empresa Alpha',
        value: 15000,
        status: 'open',
        priority: 'MEDIUM',
        contactEmail: 'alice@alpha.com',
        notes: 'Interessada em demonstração completa.',
        pipelineId: pipeline.id,
        stageId: firstStage.id,
        userId: user.id
      },
      {
        title: 'Indicação do parceiro',
        company: 'Beta Solutions',
        value: 24000,
        status: 'open',
        priority: 'HOT',
        contactEmail: 'paulo@beta.com',
        notes: 'Busca implementação em 45 dias.',
        pipelineId: pipeline.id,
        stageId: secondStage.id,
        userId: user.id
      }
    ]
  });

  console.log('Seed concluído! Credenciais demo:');
  console.log(`Email: ${email}`);
  console.log(`Senha: ${password}`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
