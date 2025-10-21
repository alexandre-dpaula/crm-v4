import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            PipelineSaaS CRM
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition hover:text-brand"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                CRM SaaS para Leads
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Organize e feche mais negócios com um Kanban feito para SaaS
              </h1>
              <p className="text-lg text-slate-600">
                Cada usuário tem o seu próprio funil, com etapas personalizáveis
                e organização por arraste e solte. Cadastre leads em segundos,
                acompanhe atividades e mantenha seu pipeline sempre atualizado.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="rounded-md bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-600"
                >
                  Começar agora
                </Link>
                <Link
                  href="/login"
                  className="text-base font-semibold text-slate-600 hover:text-brand"
                >
                  Já sou cliente
                </Link>
              </div>
              <div className="flex gap-6 text-sm text-slate-500">
                <span>• Trial gratuito 14 dias</span>
                <span>• Sem cartão de crédito</span>
                <span>• Cancelamento a qualquer momento</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Funil do mês
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Meta R$ 185K
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                  +32% vs mês anterior
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: 'Novos', value: '24 leads', amount: 'R$ 42K' },
                  { title: 'Contato Feito', value: '18 leads', amount: 'R$ 58K' },
                  { title: 'Qualificados', value: '11 leads', amount: 'R$ 54K' },
                  { title: 'Fechados', value: '7 ganhos', amount: 'R$ 31K' }
                ].map((column) => (
                  <div
                    key={column.title}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-500">
                      {column.title}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">
                      {column.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Potencial: {column.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-3">
              {[
                {
                  title: 'Kanban inteligente',
                  description:
                    'Arraste e solte seus cards, renomeie etapas e personalize cores para espelhar seu processo comercial.'
                },
                {
                  title: 'Segurança multi-tenant',
                  description:
                    'Cada usuário enxerga apenas os próprios leads. Ideal para operações SaaS em escala.'
                },
                {
                  title: 'Formulários rápidos',
                  description:
                    'Crie e edite oportunidades em modais, com validação em tempo real e histórico de atividades.'
                }
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold">
              Centralize seu funil e simplifique a operação comercial
            </h2>
            <p className="max-w-2xl text-slate-300">
              PipelineSaaS é a camada central de relacionamento para empresas de
              assinatura que precisam focar em conversão. Integrações por API,
              auditoria completa e dashboards prontos para decisões.
            </p>
            <Link
              href="/register"
              className="rounded-md bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Iniciar teste gratuito
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} PipelineSaaS. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-brand">
              Termos
            </Link>
            <Link href="#" className="hover:text-brand">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
