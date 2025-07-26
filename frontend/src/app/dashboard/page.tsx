export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Dashboard - Simple Wallet
          </h1>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card de Saldo Total */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Saldo Total
              </h3>
              <p className="text-3xl font-bold text-green-600">
                R$ 2.450,00
              </p>
              <p className="text-sm text-gray-500 mt-1">
                +R$ 150,00 este mês
              </p>
            </div>

            {/* Card de Receitas */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Receitas do Mês
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                R$ 3.200,00
              </p>
              <p className="text-sm text-gray-500 mt-1">
                +12% vs mês anterior
              </p>
            </div>

            {/* Card de Despesas */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Despesas do Mês
              </h3>
              <p className="text-3xl font-bold text-red-600">
                R$ 1.850,00
              </p>
              <p className="text-sm text-gray-500 mt-1">
                -5% vs mês anterior
              </p>
            </div>
          </div>

          {/* Seção de Transações Recentes */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Transações Recentes
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-slate-600">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Supermercado ABC</p>
                  <p className="text-sm text-gray-500">Alimentação • Hoje</p>
                </div>
                <span className="text-red-600 font-semibold">-R$ 85,50</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-slate-600">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Salário</p>
                  <p className="text-sm text-gray-500">Trabalho • Ontem</p>
                </div>
                <span className="text-green-600 font-semibold">+R$ 3.200,00</span>
              </div>
              <div className="flex justify-between items-center p-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Posto de Gasolina</p>
                  <p className="text-sm text-gray-500">Transporte • 2 dias atrás</p>
                </div>
                <span className="text-red-600 font-semibold">-R$ 120,00</span>
              </div>
            </div>
          </div>

          {/* Aviso sobre área protegida */}
          <div className="mt-8 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">🎉 Área protegida!</p>
            <p className="text-sm">Você está logado e pode acessar todas as funcionalidades do Simple Wallet.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
