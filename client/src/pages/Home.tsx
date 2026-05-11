import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { processCsvFile, ProcessingResult } from "@/lib/csv-processor";
import { ArrowRight, Check, Download, FileText, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileSelect = async (file: File) => {
    setFileName(file.name);
    setStep('processing');
    
    // Simulate processing delay for better UX
    setTimeout(async () => {
      try {
        const processingResult = await processCsvFile(file);
        setResult(processingResult);
        setStep('result');
      } catch (error) {
        console.error(error);
        alert("Erro ao processar arquivo. Verifique o formato.");
        setStep('upload');
      }
    }, 1500);
  };

  const handleDownload = () => {
    if (!result) return;
    
    const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CONSOLIDADO_${fileName}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setStep('upload');
    setResult(null);
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      {/* Swiss Style Header */}
      <header className="border-b-4 border-black bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                Consolidador
                <br />
                <span className="text-primary">Balancete</span>
              </h1>
            </div>
            <div className="text-right hidden md:block">
              <p className="font-mono text-sm uppercase tracking-widest mb-1">Ferramenta Financeira v1.0</p>
              <div className="w-12 h-1 bg-secondary ml-auto"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Context & Instructions */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary"></div>
                Instruções
              </h2>
              <ul className="space-y-4 font-mono text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">01.</span>
                  <span>Faça upload do seu arquivo balancete em formato CSV (separado por ponto e vírgula).</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">02.</span>
                  <span>O sistema identificará automaticamente o campo chave e consolidará duplicatas.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">03.</span>
                  <span>Linhas iniciadas com "10;" serão ignoradas conforme regra.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">04.</span>
                  <span>Baixe o arquivo processado e consolidado instantaneamente.</span>
                </li>
              </ul>
            </div>

            <div className="hidden lg:block">
              <img 
                src="/hero-swiss.png" 
                alt="Financial Data Visualization" 
                className="w-full border border-black grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>

          {/* Right Column: Application Logic */}
          <div className="lg:col-span-8">
            {step === 'upload' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
            )}

            {step === 'processing' && (
              <Card className="p-12 border-2 border-black bg-white flex flex-col items-center justify-center text-center min-h-[400px]">
                <RefreshCw className="w-16 h-16 text-primary animate-spin mb-6" />
                <h3 className="text-3xl font-bold uppercase tracking-tight mb-2">Processando Dados</h3>
                <p className="font-mono text-muted-foreground">Analisando estrutura e consolidando registros...</p>
              </Card>
            )}

            {step === 'result' && result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary text-white p-4 border border-black">
                    <p className="font-mono text-xs uppercase opacity-80 mb-1">Total Entrada</p>
                    <p className="text-3xl font-bold">{result.stats.total_linhas_entrada}</p>
                  </div>
                  <div className="bg-white p-4 border border-black">
                    <p className="font-mono text-xs uppercase text-muted-foreground mb-1">Ignoradas (10;)</p>
                    <p className="text-3xl font-bold">{result.stats.linhas_ignoradas}</p>
                  </div>
                  <div className="bg-white p-4 border border-black">
                    <p className="font-mono text-xs uppercase text-muted-foreground mb-1">Processadas</p>
                    <p className="text-3xl font-bold">{result.stats.linhas_processadas}</p>
                  </div>
                  <div className="bg-secondary text-white p-4 border border-black">
                    <p className="font-mono text-xs uppercase opacity-80 mb-1">Consolidadas</p>
                    <p className="text-3xl font-bold">{result.stats.linhas_saida}</p>
                  </div>
                </div>

                {/* Success Card */}
                <Card className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center border-2 border-black rounded-full">
                        <Check className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold uppercase">Sucesso!</h3>
                        <p className="font-mono text-sm text-muted-foreground">
                          Arquivo <strong>{fileName}</strong> processado corretamente.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="flex-1 md:flex-none border-2 border-black hover:bg-gray-100 rounded-none font-bold uppercase"
                      >
                        Novo Arquivo
                      </Button>
                      <Button 
                        onClick={handleDownload}
                        className="flex-1 md:flex-none bg-black text-white hover:bg-gray-800 rounded-none border-2 border-black font-bold uppercase flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar CSV
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Preview Table */}
                <div className="border border-black bg-white">
                  <div className="bg-black text-white p-4 flex justify-between items-center">
                    <h4 className="font-bold uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Pré-visualização (5 primeiros registros)
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-sm">
                      <thead>
                        <tr className="border-b border-black bg-gray-50">
                          <th className="p-3 text-left border-r border-black">Campo Chave</th>
                          <th className="p-3 text-right border-r border-black">Saldo Inicial</th>
                          <th className="p-3 text-right border-r border-black">Débito</th>
                          <th className="p-3 text-right border-r border-black">Crédito</th>
                          <th className="p-3 text-right">Saldo Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.preview.map((row, i) => (
                          <tr key={i} className="border-b border-gray-200 hover:bg-blue-50">
                            <td className="p-3 border-r border-gray-200 truncate max-w-[200px]" title={row.campo_chave}>
                              {row.campo_chave}
                            </td>
                            <td className="p-3 text-right border-r border-gray-200">
                              {row.saldo_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {row.natureza_saldo_inicial}
                            </td>
                            <td className="p-3 text-right border-r border-gray-200">
                              {row.debito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right border-r border-gray-200">
                              {row.credito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right font-bold">
                              {row.saldo_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {row.natureza_saldo_final}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t-4 border-black bg-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-sm uppercase tracking-widest mb-4">
            Design Suíço & Precisão Contábil
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-4 h-4 bg-primary"></div>
            <div className="w-4 h-4 bg-secondary"></div>
            <div className="w-4 h-4 bg-black"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
