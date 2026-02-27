export interface ContentData {
    folderNames: {
        specialChars: string;
        prefix: string;
    };
    urls: {
        invalid: string;
    };
    search: {
        searchTerm: string;
    };
    performance: {
        largeFileUploadTimeout: number;
        multipleOperationsTimeout: number;
    };
    errorPatterns: {
        duplicate: string;
    };
    viewModes: {
        grid: string;
        list: string;
        card: string;
    };
}
