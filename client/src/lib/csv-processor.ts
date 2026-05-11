
export interface ConsolidatedRecord {
  campo_chave: string;
  saldo_inicial: number;
  natureza_saldo_inicial: 'C' | 'D';
  debito: number;
  credito: number;
  saldo_final: number;
  natureza_saldo_final: 'C' | 'D';
}

export interface ProcessingStats {
  total_linhas_entrada: number;
  linhas_ignoradas: number;
  linhas_processadas: number;
  campos_chave_unicos: number;
  linhas_saida: number;
}

export interface ProcessingResult {
  data: string; // CSV content
  stats: ProcessingStats;
  preview: ConsolidatedRecord[]; // First few records for preview
}

function parseValue(valueStr: string): number {
  if (!valueStr || valueStr === '') return 0.0;
  // Remove dots (thousands separator) and replace comma with dot (decimal separator)
  return parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
}

function formatValue(value: number): string {
  // Format with 2 decimal places, using comma as decimal separator
  const formatted = Math.abs(value).toFixed(2);
  // Replace dot with comma (Brazilian format without thousands separator)
  return formatted.replace('.', ',');
}

function parseLine(line: string): ConsolidatedRecord | null {
  const fields = line.trim().split(';');
  
  // Find position of initial balance (first occurrence of C or D)
  let saldo_inicial_idx = -1;
  let natureza_saldo_inicial: 'C' | 'D' | null = null;
  
  for (let i = 0; i < fields.length; i++) {
    if (fields[i] === 'C' || fields[i] === 'D') {
      saldo_inicial_idx = i - 1;
      natureza_saldo_inicial = fields[i] as 'C' | 'D';
      break;
    }
  }
  
  if (saldo_inicial_idx === -1 || !natureza_saldo_inicial) {
    return null;
  }
  
  // Extract key field
  const campo_chave = fields.slice(0, saldo_inicial_idx).join(';');
  
  // Extract values
  const saldo_inicial = parseValue(fields[saldo_inicial_idx]);
  const debito = parseValue(fields[saldo_inicial_idx + 2]);
  const credito = parseValue(fields[saldo_inicial_idx + 3]);
  const saldo_final = parseValue(fields[saldo_inicial_idx + 4]);
  const natureza_saldo_final = (fields[saldo_inicial_idx + 5] || 'D') as 'C' | 'D';
  
  return {
    campo_chave,
    saldo_inicial,
    natureza_saldo_inicial,
    debito,
    credito,
    saldo_final,
    natureza_saldo_final
  };
}

function consolidateRecords(records: ConsolidatedRecord[]): ConsolidatedRecord | null {
  if (!records || records.length === 0) return null;
  
  let total_saldo_inicial = 0.0;
  let total_debito = 0.0;
  let total_credito = 0.0;
  let total_saldo_final = 0.0;
  
  for (const rec of records) {
    // Initial Balance
    if (rec.natureza_saldo_inicial === 'D') {
      total_saldo_inicial += rec.saldo_inicial;
    } else { // C
      total_saldo_inicial -= rec.saldo_inicial;
    }
    
    // Debit and Credit are always added
    total_debito += rec.debito;
    total_credito += rec.credito;
    
    // Final Balance
    if (rec.natureza_saldo_final === 'D') {
      total_saldo_final += rec.saldo_final;
    } else { // C
      total_saldo_final -= rec.saldo_final;
    }
  }
  
  // Determine nature of consolidated initial balance
  const natureza_saldo_inicial = total_saldo_inicial >= 0 ? 'D' : 'C';
  const saldo_inicial_abs = Math.abs(total_saldo_inicial);
  
  // Determine nature of consolidated final balance
  const natureza_saldo_final = total_saldo_final >= 0 ? 'D' : 'C';
  const saldo_final_abs = Math.abs(total_saldo_final);
  
  return {
    campo_chave: records[0].campo_chave,
    saldo_inicial: saldo_inicial_abs,
    natureza_saldo_inicial,
    debito: total_debito,
    credito: total_credito,
    saldo_final: saldo_final_abs,
    natureza_saldo_final
  };
}

function formatOutputLine(record: ConsolidatedRecord): string {
  return `${record.campo_chave};` +
         `${formatValue(record.saldo_inicial)};` +
         `${record.natureza_saldo_inicial};` +
         `${formatValue(record.debito)};` +
         `${formatValue(record.credito)};` +
         `${formatValue(record.saldo_final)};` +
         `${record.natureza_saldo_final}`;
}

export async function processCsvFile(file: File): Promise<ProcessingResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split(/\r?\n/);
        
        const recordsByKey: Record<string, ConsolidatedRecord[]> = {};
        const headersByField2: Record<string, string[]> = {}; // Store lines 10; by field 2
        let linhas_ignoradas = 0;
        let linhas_processadas = 0;
        
        // Process lines
        for (const line of lines) {
          if (!line.trim()) continue;
          
          if (line.startsWith('10;')) {
            linhas_ignoradas++;
            // Extract field 2 from line 10;
            const fields = line.split(';');
            const field2 = fields[1] || '';
            if (!headersByField2[field2]) {
              headersByField2[field2] = [];
            }
            headersByField2[field2].push(line);
            continue;
          }
          
          const record = parseLine(line);
          if (record) {
            if (!recordsByKey[record.campo_chave]) {
              recordsByKey[record.campo_chave] = [];
            }
            recordsByKey[record.campo_chave].push(record);
            linhas_processadas++;
          }
        }
        
        // Consolidate
        const consolidated: ConsolidatedRecord[] = [];
        for (const key in recordsByKey) {
          const consolidatedRecord = consolidateRecords(recordsByKey[key]);
          if (consolidatedRecord) {
            consolidated.push(consolidatedRecord);
          }
        }
        
        // Sort by second field (index 1) in ascending order
        consolidated.sort((a, b) => {
          const fieldA = a.campo_chave.split(';')[1] || '';
          const fieldB = b.campo_chave.split(';')[1] || '';
          
          // Try numeric comparison first if fields look like numbers
          const numA = parseFloat(fieldA);
          const numB = parseFloat(fieldB);
          
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          
          // Fallback to string comparison
          return fieldA.localeCompare(fieldB);
        });
        
        // Get all unique field2 values from both headers and consolidated records
        const allField2Values = new Set<string>();
        
        // Add field2 from headers
        for (const field2 in headersByField2) {
          allField2Values.add(field2);
        }
        
        // Add field2 from consolidated records
        for (const record of consolidated) {
          const field2 = record.campo_chave.split(';')[1] || '';
          allField2Values.add(field2);
        }
        
        // Sort field2 values
        const sortedField2Values = Array.from(allField2Values).sort((a, b) => {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          
          return a.localeCompare(b);
        });
        
        // Generate CSV output with headers at the top of each group
        const outputLines: string[] = [];
        
        for (const field2 of sortedField2Values) {
          // Add header (lines 10;) for this field2
          if (headersByField2[field2]) {
            for (const headerLine of headersByField2[field2]) {
              outputLines.push(headerLine);
            }
          }
          
          // Add consolidated records for this field2
          for (const record of consolidated) {
            const recordField2 = record.campo_chave.split(';')[1] || '';
            if (recordField2 === field2) {
              outputLines.push(formatOutputLine(record));
            }
          }
        }
        
        const outputCsv = outputLines.join('\n');
        
        resolve({
          data: outputCsv,
          stats: {
            total_linhas_entrada: lines.length,
            linhas_ignoradas,
            linhas_processadas,
            campos_chave_unicos: Object.keys(recordsByKey).length,
            linhas_saida: consolidated.length
          },
          preview: consolidated.slice(0, 5)
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file, 'UTF-8');
  });
}
