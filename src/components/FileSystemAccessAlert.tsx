import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isFileSystemAccessSupported } from "@/lib/fs-access";
import { TerminalIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function FileSystemAccessAlert() {
  const [fsSupported, setFsSupported] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFsSupported(isFileSystemAccessSupported());
    // initializeEsbuild();
  }, []);

  return (
    <>
      {!fsSupported && (
        <div className="container pt-4">
          <Alert>
            <TerminalIcon className="h-4 w-4" />
            <AlertTitle>Browser Support Notice</AlertTitle>
            <AlertDescription>
              File System Access API not supported. Drag-and-drop fallback is
              available.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
