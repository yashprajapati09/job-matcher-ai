import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadSectionProps {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}

export function UploadSection({
  title,
  placeholder,
  value,
  onChange,
  icon,
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
      // For PDF files, we'll extract text client-side using a simple approach
      // In production, you'd use a proper PDF library or backend service
      else if (file.type === "application/pdf") {
        // Read as base64 for display, but prompt user to paste text
        const reader = new FileReader();
        reader.onload = () => {
          onChange(`[PDF File: ${file.name}]\n\nNote: PDF parsing is limited in browser. For best results, please copy and paste the text content from your PDF below:\n\n`);
        };
        reader.readAsDataURL(file);
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <h3 className="font-display font-semibold text-lg">{title}</h3>
      </div>

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
                <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Drop file here or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports TXT, PDF, DOC, DOCX</p>
                </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
