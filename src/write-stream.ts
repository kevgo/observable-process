// A stream that we can write into using write(string),
// plus some boilerplate to make process.stdout fit in here.
export interface WriteStream {
  write(
    chunk: Buffer | string,
    encodingOrCallback?: string | Function,
    callback?: Function
  ): boolean
}
