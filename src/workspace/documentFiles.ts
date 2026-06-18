import mammoth from 'mammoth/mammoth.browser'

import type { DocumentPreviewKind } from './core'
import { readFileAsDataUrl } from './core'

type DocumentUploadPayload = {
  fileName: string
  fileSize: number
  mimeType: string
  extension: string
  dataUrl: string
  previewKind: DocumentPreviewKind
  previewContent: string | null
}

type UnsupportedUploadWarning = {
  fileName: string
  extensionLabel: string
}

const PDF_MIME_TYPE = 'application/pdf'
const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const SUPPORTED_DOCUMENT_EXTENSIONS = new Set(['pdf', 'docx', 'txt'])

function getFileExtension(fileName: string) {
  const match = /\.([^.]+)$/.exec(fileName)
  return match ? match[1].toLowerCase() : ''
}

function getDocumentPreviewKind(file: File): DocumentPreviewKind | null {
  const extension = getFileExtension(file.name)

  if (file.type === PDF_MIME_TYPE || extension === 'pdf') {
    return 'pdf'
  }

  if (file.type === DOCX_MIME_TYPE || extension === 'docx') {
    return 'docx'
  }

  if (
    extension === 'txt' ||
    (file.type.startsWith('text/') && extension !== 'html' && extension !== 'htm')
  ) {
    return 'text'
  }

  return null
}

function isSupportedDocumentFile(file: File) {
  const extension = getFileExtension(file.name)
  return SUPPORTED_DOCUMENT_EXTENSIONS.has(extension) || getDocumentPreviewKind(file) !== null
}

function getUnsupportedUploadWarning(file: File): UnsupportedUploadWarning {
  const extension = getFileExtension(file.name)

  return {
    fileName: file.name,
    extensionLabel: extension ? `.${extension}` : file.type.trim() || 'This file type',
  }
}

async function convertDocxToPreviewHtml(file: File) {
  const result = await mammoth.convertToHtml(
    {
      arrayBuffer: await file.arrayBuffer(),
    },
    {
      ignoreEmptyParagraphs: false,
    },
  )

  return result.value.trim() || '<p>This document is empty.</p>'
}

async function createDocumentUploadPayload(file: File): Promise<DocumentUploadPayload> {
  const previewKind = getDocumentPreviewKind(file)

  if (!previewKind) {
    throw new Error(`Unsupported document type: ${file.name}`)
  }

  const [dataUrl, previewContent] = await Promise.all([
    readFileAsDataUrl(file),
    previewKind === 'docx'
      ? convertDocxToPreviewHtml(file)
      : previewKind === 'text'
      ? file.text()
      : Promise.resolve<string | null>(null),
  ])

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    extension: getFileExtension(file.name) || (previewKind === 'text' ? 'txt' : previewKind),
    dataUrl,
    previewKind,
    previewContent,
  }
}

function formatFileSize(fileSize: number) {
  if (fileSize < 1024) {
    return `${Math.max(0, Math.round(fileSize))} B`
  }

  if (fileSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileSize / 1024))} KB`
  }

  const megaBytes = fileSize / (1024 * 1024)
  return `${megaBytes >= 10 ? megaBytes.toFixed(0) : megaBytes.toFixed(1)} MB`
}

export type { DocumentUploadPayload, UnsupportedUploadWarning }
export {
  createDocumentUploadPayload,
  formatFileSize,
  getDocumentPreviewKind,
  getFileExtension,
  getUnsupportedUploadWarning,
  isSupportedDocumentFile,
}
