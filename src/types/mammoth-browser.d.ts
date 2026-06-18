declare module 'mammoth/mammoth.browser' {
  type ConvertInput = {
    arrayBuffer: ArrayBuffer
  }

  type ConvertOptions = {
    ignoreEmptyParagraphs?: boolean
  }

  type ConvertResult = {
    value: string
    messages: Array<{
      type: 'warning' | 'error'
      message: string
    }>
  }

  const mammoth: {
    convertToHtml: (input: ConvertInput, options?: ConvertOptions) => Promise<ConvertResult>
  }

  export default mammoth
}
