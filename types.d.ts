interface SuccessResult {
    success: true;
    message: string;
    data: any;
}

interface FailureResult {
    success: false;
    message: string;
    error?: string;
}

type SelectFolderResult = SuccessResult | FailureResult

interface Window {
    electronAPI: {
        selectFolder: () => Promise<SelectFolderResult>;
        
    }
}