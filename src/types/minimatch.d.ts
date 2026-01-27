// Type definitions for minimatch
// Minimum TypeScript Version: 4.0

declare module 'minimatch' {
  function minimatch(target: string, pattern: string, options?: minimatch.IOptions): boolean;
  
  namespace minimatch {
    interface IOptions {
      debug?: boolean;
      nobrace?: boolean;
      noglobstar?: boolean;
      dot?: boolean;
      noext?: boolean;
      nocase?: boolean;
      nonull?: boolean;
      matchBase?: boolean;
      nocomment?: boolean;
      nonegate?: boolean;
      flipNegate?: boolean;
    }
    
    function match(files: string[], pattern: string, options?: IOptions): string[];
  }
  
  export = minimatch;
}
