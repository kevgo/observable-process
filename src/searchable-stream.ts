import { TextStreamSearch } from "text-stream-search"

/**
 * the API we use to search streams for text or regular expressions
 */
export interface TextStreamSearcher {
  fullText(): string
  waitForText(text: string, timeout?: number): Promise<string>
  waitForRegex(regex: RegExp, timeout?: number): Promise<string>
}

/**
 * A NodeJS.ReadableStream decorated with additional capabilities
 * to search the stream content.
 */
export type SearchableStream = NodeJS.ReadableStream & TextStreamSearcher

export function createSearchableStream(stream: NodeJS.ReadableStream): SearchableStream {
  const result = stream as SearchableStream
  const search = new TextStreamSearch(stream)
  result.waitForText = async function (text: string, timeout?: number) {
    return search.waitForText(text, timeout)
  }
  result.waitForRegex = async function (regex: RegExp, timeout?: number) {
    return search.waitForRegex(regex, timeout)
  }
  result.fullText = function () {
    return search.fullText()
  }
  return result
}
