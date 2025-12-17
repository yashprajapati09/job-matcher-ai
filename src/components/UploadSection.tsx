import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface UploadSectionProps {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  mode?: "both" | "paste" | "upload";
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n\n";
  }
  
  return fullText.trim();
}

export function UploadSection({
  title,
  placeholder,
  value,
  onChange,
  icon,
  mode = "both",
}: UploadSectionProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    try {
      // For text files, read directly
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        onChange(text);
      } 
      // For PDF files, extract text using PDF.js
      else if (file.type === "application/pdf") {
        const extractedText = await extractTextFromPDF(file);
        if (extractedText.trim()) {
          onChange(extractedText);
        } else {
          onChange(`[PDF File: ${file.name}]\n\nNote: Could not extract text from PDF. The PDF may be image-based. Please copy and paste the text content manually.`);
        }
      }
      // For Word docs
      else if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
        onChange(`[Document: ${file.name}]\n\nNote: Document parsing is limited in browser. For best results, please copy and paste the text content below:\n\n`);
      }
      else {
        // Try to read as text
        const text = await file.text();
        onChange(text);
      }
    } catch (error) {
      console.error("Error reading file:", error);
      onChange(`Error reading file: ${file.name}. Please paste the content manually.`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderUploadArea = () => (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.pdf,.doc,.docx"
        className="hidden"
      />
      
      {!fileName ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-[200px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="font-medium text-foreground">Extracting text from PDF...</p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Drop file here or click to upload</p>
                <p className="text-sm text-muted-foreground mt-1">Supports TXT, PDF, DOC, DOCX</p>
              </div>
            </>
          )}
        </button>
      ) : (
        <div className="h-[200px] border border-border rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium truncate max-w-[200px]">{fileName}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            placeholder="File content will appear here. You can edit or add to it..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 resize-none text-sm"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <h3 className="font-display font-semibold text-lg">{title}</h3>
      </div>

      {mode === "both" ? (
        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-3">
            <Textarea
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[200px] resize-y font-sans text-sm leading-relaxed"
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-3">
            {renderUploadArea()}
          </TabsContent>
        </Tabs>
      ) : mode === "paste" ? (
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] resize-y font-sans text-sm leading-relaxed mt-3"
        />
      ) : (
        <div className="mt-3">{renderUploadArea()}</div>
      )}
    </div>
  );
}
