/* 📖 # Why declare a git-info module?
The git-info file is generated during builds and can be absent in some flows.
Declaring the module keeps TypeScript happy for dynamic imports without
requiring the file to exist at typecheck time.
*/
declare module '../../git-info' {
  export const GIT_INFO: {
    commitHash: string
    commitDate: string
    commitMessage: string
  }
}
