import { TextStreamSearch } from "text-stream-search"

/** the API to search streams for text or regular expressions */
interface TextStreamSearcher {
  fullText(): string
  waitForRegex(regex: RegExp, timeout?: number): Promise<string>
  waitForText(text: string, timeout?: number): Promise<string>
}

/** A NodeJS.ReadableStream that can search the stream content. */
export type Stream = NodeJS.ReadableStream & TextStreamSearcher

export function wrapStream(stream: NodeJS.ReadableStream): Stream {
  const result = stream as Stream
  const search = new TextStreamSearch(stream)
  result.waitForText = async function(text: string, timeout?: number) {
    return search.waitForText(text, timeout)
  }
  result.waitForRegex = async function(regex: RegExp, timeout?: number) {
    return search.waitForRegex(regex, timeout)
  }
  result.fullText = function() {
    return search.fullText()
  }
  return result
}
