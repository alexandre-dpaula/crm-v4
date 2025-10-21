import Link from 'next/link';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col lg:flex-row">
        <div className="hidden w-full bg-gradient-to-br from-blue-600 to-indigo-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">PipelineSaaS CRM</h1>
            <p className="mt-4 max-w-md text-blue-100">
              Organize seus leads, personalize seu funil e acelere suas vendas
              com painéis Kanban em tempo real.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-blue-200">
              Destaques
            </p>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>• Kanban editável com arraste e solte</li>
              <li>• Multi-tenant protegido: cada usuário vê apenas seus leads</li>
              <li>• Modais rápidos para criar, editar e excluir oportunidades</li>
            </ul>
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
