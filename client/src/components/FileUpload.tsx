import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        alert("Por favor, selecione um arquivo CSV.");
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <Card 
      className={`
        relative overflow-hidden border-2 border-black transition-all duration-200
        ${isDragging ? 'bg-accent' : 'bg-white'}
      `}
    >
      <div 
        className="p-12 flex flex-col items-center justify-center text-center space-y-6"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-24 h-24 bg-black text-white flex items-center justify-center mb-4">
          <Upload className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight uppercase">
            Upload de Balancete
          </h3>
          <p className="text-muted-foreground font-mono text-sm">
            Arraste seu arquivo CSV aqui ou clique para selecionar
          </p>
        </div>

        {selectedFile && (
          <div className="w-full max-w-md bg-accent p-4 border border-black mt-4">
            <p className="font-mono text-sm truncate">
              Arquivo selecionado: <strong>{selectedFile.name}</strong>
            </p>
          </div>
        )}

        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button 
            variant="default" 
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none border-2 border-transparent hover:border-black transition-all uppercase font-bold tracking-wider"
          >
            Selecionar Arquivo
          </Button>
        </div>
      </div>
      
      {/* Swiss Style Decorative Elements */}
      <div className="absolute top-0 left-0 w-4 h-4 bg-black" />
      <div className="absolute top-0 right-0 w-4 h-4 bg-black" />
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-black" />
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-black" />
    </Card>
  );
}
